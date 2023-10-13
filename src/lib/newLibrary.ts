import { createStore, createIndexes, createCheckpoints, createQueries } from "tinybase/with-schemas"
import { createLocalPersister } from "tinybase/persisters/persister-browser"
import { getFileHandlesRecursively } from "./fileSystemAccess"
import { filter, collect } from "./asyncIter"
import { each } from "async"
import { get, writable } from "svelte/store"
import epub, { Book, type NavItem } from "epubjs"
import { size, toastError, uniqBy } from "./util"
import { showDirectoryPicker } from "native-file-system-adapter"

export const directoryHandle = writable<FileSystemDirectoryHandle | null>(null)
export async function setDirectory() {
	try {
		directoryHandle.set(await showDirectoryPicker({ id: "epubber-library", startIn: "documents" }))
		await navigator?.storage?.persist()
	} catch (error) {
		toastError('Directory', error)
	}
}

// TODO: Handle covers
export const db = createStore()
	.setTablesSchema({
		books: {
			title: { type: 'string' },
			creator: { type: 'string' },
			path: { type: 'string' },
		},
		chapters: {
			bookIdentifier: { type: 'string' },
			identifier: { type: 'string' },
			index: { type: 'number' },
			label: { type: 'string' },
			sectionIndex: { type: 'string' },
			// A percentage from 0 to 1.
			readingProgress: { type: 'number', default: 0 },
			notes: { type: 'string', default: null },
			parent: { type: 'string', default: null },
			completed: { type: 'boolean', default: false }
		}
	})
export const persister = createLocalPersister(db, 'epubber')
await persister.startAutoLoad()
await persister.startAutoSave()
export const queries = createQueries(db)
	.setQueryDefinition('library', 'chapters', ({ select, where, join, group }) => {
		select('bookIdentifier')
		select('bookIdentifier').as('identifier')
		join('books', 'bookIdentifier')
		select('books', 'title')
		select('books', 'creator')
		// Unread chapters
		where(getCell => getCell('readingProgress') !== 1)
		// Unread chapter count
		group('bookIdentifier', 'count').as('unreadCount')
	})
export const indexes = createIndexes(db)
	.setIndexDefinition(
		'chaptersByBook',
		'chapters',
		'bookIdentifier',
		'index'
	)
export const checkpoints = createCheckpoints(db)

export function createChapterIdentifier(bookIdentifier: string, chapterIdentifier: string): string {
	return JSON.stringify([bookIdentifier, chapterIdentifier])
}

function* flattenNavItems(navItems: NavItem[]): Iterable<NavItem> {
	for (const item of navItems) {
		yield item
		if (item.subitems?.length > 0) yield* flattenNavItems(item.subitems)
	}
}
export const ongoingScan = writable<[amount: number, total: number] | undefined | null>(null)
export async function scanDirectory() {
	ongoingScan.set(undefined)

	try {
		const dirHandle = get(directoryHandle)
		const fileHandles = getFileHandlesRecursively(dirHandle)
		const epubHandles = await collect(filter(fileHandles, (file) => file.name.endsWith(".epub")))
		const books = epubHandles.map(async epubHandle => {
			const blobUrl = URL.createObjectURL(await epubHandle.getFile())
			// TODO: Toast and continue on error
			// https://github.com/futurepress/epub.js/issues/1320#issuecomment-1455009846
			const book = epub(blobUrl, { openAs: 'epub' })
			const [
				{ identifier: bookIdentifier, title, creator },
				{ toc }
			] = await Promise.all([book.loaded.metadata, book.loaded.navigation])

			// TODO: Only allow unique sectionIndexes by path (no hash)
			const fullToc = uniqBy(
				Array.from(flattenNavItems(toc)),
				(item) => new URL(item.href, 'http://example.com').pathname
			)

			const result = {
				bookIdentifier,
				bookRow: {
					title,
					creator,
					path: JSON.stringify(await dirHandle.resolve(epubHandle)),
				},
				chapters: fullToc
					.filter(({ href, id, label }) => href && id && label)
					.map(({ label, href: sectionIndex, id: identifier, parent }, index) => ({
						bookIdentifier,
						identifier,
						index,
						label,
						sectionIndex,
						readingProgress: 0,
						notes: null,
						parent,
						completed: false,
					})),
			}

			book.destroy()
			URL.revokeObjectURL(blobUrl)

			return result
		})

		const scanBegin = new Date

		ongoingScan.set([0, epubHandles.length])
		checkpoints.addCheckpoint(`import@${scanBegin.toISOString()}: begin`)
		await each(
			books,
			async book => {
				const { bookIdentifier, bookRow, chapters } = await book
				db.setRow('books', bookIdentifier, bookRow)

				// Be careful not to overwrite existing data
				for (const chapter of chapters) {
					const rowId = createChapterIdentifier(bookIdentifier, chapter.identifier) 
					if (!size(db.getRow('chapters', rowId))) {
						db.setRow('chapters', rowId, chapter)
					}
				}
				ongoingScan.update(([amount, total]) => [amount + 1, total])
			}
		)
		checkpoints.addCheckpoint(`import@${scanBegin.toISOString()}: end`)
	} catch (error) {
		toastError('Scan', error)
		checkpoints.goBackward()
	} finally {
		ongoingScan.set(null)
	}
}

async function getFile(path: string[]) {
	let directory = get(directoryHandle)
	for (const folder of path.slice(0, path.length - 1)) {
		directory = await directory.getDirectoryHandle(folder)
	}
	return await directory.getFileHandle(path[path.length - 1])
}

// TODO: Error handling
export async function getEpub(identifier: string): Promise<Book | null> {
	const bookRow = db.getRow('books', identifier)
	if (!size(bookRow)) return null
	const epubHandle = await getFile(JSON.parse(bookRow.path))
	const blobUrl = URL.createObjectURL(await epubHandle.getFile())
	// https://github.com/futurepress/epub.js/issues/1320#issuecomment-1455009846
	const book = epub(blobUrl, { openAs: 'epub' })
	// TODO: Return blobUrl so book can be unloaded
	return book
}

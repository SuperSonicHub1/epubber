import epub, * as Epub from "epubjs"
import type { PackagingMetadataObject } from "epubjs/types/packaging"
import { collect } from "./asyncIter"
import { getFileHandlesRecursively } from "./fileSystemAccess"
import { writable } from "svelte/store"
import { each } from "async"

const parser = new DOMParser()

export class Book {
	blobUrl: string
	filePath: string[]
	book: Epub.Book
	metadata: PackagingMetadataObject
	private cover: string | null | undefined

	constructor(
		blobUrl: string,
		filePath: string[],
		book: Epub.Book,
		metadata: PackagingMetadataObject,
	) {
		this.blobUrl = blobUrl
		this.filePath = filePath
		this.book = book
		this.metadata = metadata
	}

	static async createFromFileHandle(epubFile: FileSystemFileHandle, ancestorDir: FileSystemDirectoryHandle): Promise<Book> {
		const blobUrl = URL.createObjectURL(await epubFile.getFile())
		// https://github.com/futurepress/epub.js/issues/1320#issuecomment-1455009846
		const book = epub(blobUrl, { openAs: 'epub' })
		return new Book(
			blobUrl,
			await ancestorDir.resolve(epubFile),
			book,
			await book.loaded.metadata,
		)
	}

	get title(): string {
		return this.metadata.title
	}

	get identifier(): string {
		return this.metadata.identifier
	}

	/**
	 * My O'Reilly books have XHTML covers, so this will extract them if that's the case.
	 */
	async getCover(): Promise<string | null> {
		if (this.cover === undefined) {
			const coverUrl = await this.book.coverUrl()
			if (coverUrl) this.cover = coverUrl
			else {
				await this.book.loaded.manifest

				for (const key of ['default_cover', 'cover']) {
					const cover = this.book.packaging.manifest[key]
					if (cover && cover.type === 'application/xhtml+xml') {
						const { body } = parser.parseFromString(
							await this.book.archive.getText("/OEBPS/" + cover.href),
							cover.type
						)
						const coverEl = body.querySelector('#Cover img') || body.querySelector('img')
						if (coverEl) this.cover = await this.book.archive.createUrl(
							"/OEBPS/" + coverEl.getAttribute('src'),
							{ base64: false }
						)
					}
				}
			}

			if (this.cover === undefined) this.cover = null
		}

		return this.cover
	}
}

export async function loadLibrary() {
	const dirHandle = await window.showDirectoryPicker({ id: "epubber-library", startIn: "documents" })
	const fileHandles = await collect(getFileHandlesRecursively(dirHandle))
	const epubHandles = await fileHandles.filter((file) => file.name.endsWith(".epub"))
	libraryCount.set(epubHandles.length)
	library.set([])
	return await each(
		epubHandles.map(async ebubHandle => await Book.createFromFileHandle(
			ebubHandle,
			dirHandle,
		)),
		async book => {
			const awaitedBook = await book
			library.update(books => [...books, awaitedBook])
		} 
	)
}

export const library = writable<Book[] | null>(null)
export const libraryCount = writable<number>(0)

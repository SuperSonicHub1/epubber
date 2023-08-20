import { sort } from "@accuser/svelte-store-array"
import { toastStore } from "@skeletonlabs/skeleton"
import { derived, type Readable } from "svelte/store"

export function keyComparator<T>(key: keyof T): (a: T, b: T) => number {
	return (a, b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0)
}

// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_sortby-and-_orderby
export function sortBy<T>(array: T[], key: keyof T): T[] {
	return array.concat().sort(keyComparator(key))
}

export function sortStoreBy<T>(store: Readable<T[]>, key: keyof T): Readable<T[]> {
	return sort(store, keyComparator(key))
}

export function size(o: object): number {
	return Object.keys(o).length
}

export function objectValues<K extends string | number | symbol, T>(store: Readable<Record<K, T>>): Readable<T[]> {
	return derived(store, ($store) => Object.values($store) as T[])
}

export function toastError(kind: string, error: Error): void {
	console.error(error)
	toastStore.trigger({
		message: `${kind} error: ${error.message}`,
		background: 'bg-error-500'
	})
}

// https://stackoverflow.com/a/40808569
export function uniqBy<T>(arr: T[], predicate: keyof T | ((o: T) => any)): T[] {
	const cb = typeof predicate === 'function' ? predicate : (o) => o[predicate]

	const uniqMap = arr.reduce((map, item) => {
		const key = (item === null || item === undefined) ?
			item : cb(item)
		if (!map.has(key)) map.set(key, item)
		return map
	}, new Map<any, T>())

	return Array.from(uniqMap.values())
}

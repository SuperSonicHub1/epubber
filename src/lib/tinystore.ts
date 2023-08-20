/**
 * An implementation of the Svelte store contract <https://svelte.dev/docs#component-format-script-4-prefix-stores-with-$-to-access-their-values-store-contract>
 * for TinyBase.
 * TODO: Consider making this a library.
 * TODO: Add `with-schemas` support.
 */

import type { Store, Row, CellOrUndefined } from "tinybase/store"
import { derived, readable, writable, type Readable, type Writable, get } from "svelte/store"
import type { Id } from "tinybase/common"
import type { Relationships } from "tinybase/relationships"
import { map } from "@accuser/svelte-store-array"
import type { Group, Having, Join, Queries, Select, Where } from "tinybase/queries"
import type { Indexes } from "tinybase/indexes"

// From hotsheet: https://github.com/SuperSonicHub1/hotsheet/blob/fe6d5bf9087127e6d67a62a9c9fc769608c41a93/src/lib/tinystore.ts#L7-L40
// Code inspired by https://github.com/babichjacob/svelte-localstorage/blob/main/projects/svelte-localstorage/browser.js
export function cell(store: Store, tableId: Id, rowId: Id, cellId: Id): Writable<CellOrUndefined> {
	let currentValue = store.getCell(tableId, rowId, cellId)

	const sync = (value) => {
		setStore(value)
		currentValue = value
	}

	const set = (value) => {
		sync(value)
		store.setCell(tableId, rowId, cellId, value)
	}

	const update = (fn) => {
		set(fn(currentValue))
	}

	const { set: setStore, subscribe } = writable(currentValue, (_set) => {
		const listenerId = store.addCellListener(
			tableId,
			rowId,
			cellId,
			(_store, _tableId, _rowId, _cellId, newCell) => {
				sync(newCell)
			}
		)

		return () => store.delListener(listenerId)
	})


	return { subscribe, set, update }
}

export function table(store: Store, tableId: Id) {
	return readable(store.getTable(tableId), set => {
		const listenerId = store.addTableListener(tableId, (store, tableId) => {
			set(store.getTable(tableId))
		})
		return () => store.delListener(listenerId)
	})
}

export function row(store: Store, tableId: Id, rowId: Id) {
	return readable(store.getRow(tableId, rowId), set => {
		const listenerId = store.addRowListener(tableId, rowId, (store, tableId, rowId) => {
			set(store.getRow(tableId, rowId))
		})
		return () => store.delListener(listenerId)
	})
}

export function rows(store: Store, tableId: Id): Readable<Row[]> {
	return derived(table(store, tableId), Object.values)
}

export function localRowIds(relationships: Relationships, relationshipId: Id, remoteRowId: Id) {
	return readable(relationships.getLocalRowIds(relationshipId, remoteRowId), set => {
		const listenerId = relationships.addLocalRowIdsListener(
			relationshipId,
			remoteRowId,
			(relationships, relationshipId, remoteRowId) => {
				set(relationships.getLocalRowIds(relationshipId, remoteRowId))
			}
		)
		return () => relationships.delListener(listenerId)
	})
}

export function localRows(relationships: Relationships, relationshipId: Id, remoteRowId: Id) {
	const store = relationships.getStore(),
		localTableId = relationships.getLocalTableId(relationshipId)
	return map(
		localRowIds(relationships, relationshipId, remoteRowId),
		(rowId) => store.getRow(localTableId, rowId)
	)
}

export function resultTable(queries: Queries, queryId: Id) {
	return readable(queries.getResultTable(queryId), set => {
		const listenerId = queries.addResultTableListener(
			queryId,
			(queries, queryId) => {
				set(queries.getResultTable(queryId))
			}
		)
		return () => queries.delListener(listenerId)
	})
}

export function index(indexes: Indexes, indexId: Id, sliceId: Id) {
	return readable(indexes.getSliceRowIds(indexId, sliceId), set => {
		const listenerId = indexes.addSliceRowIdsListener(
			indexId,
			sliceId,
			(indexes, indexId, sliceId) => {
				set(indexes.getSliceRowIds(indexId, sliceId))
			}
		)
		return () => indexes.delListener(listenerId)
	})
}

export function indexRows(indexes: Indexes, indexId: Id, sliceId: Id) {
	const tableId = indexes.getTableId(indexId)
	return derived(
		[
			index(indexes, indexId, sliceId),
			table(indexes.getStore(), tableId)
		],
		([$index, $table]) => Object
			.entries($table)
			.filter(([id, ]) => $index.includes(id))
			.map(([, row]) => row)
	)
}

export function componentQuery(queries: Queries, tableId: Id, query: (keywords: {
	select: Select
	join: Join
	where: Where
	group: Group
	having: Having
}) => void) {
	const queryId = crypto.randomUUID()
	queries.setQueryDefinition(queryId, tableId, query)
	const store = resultTable(queries, queryId)
	return derived(
		store,
		(_, set) => {
			const unsubscribe = store.subscribe(set)
			return () => {
				unsubscribe()
				queries.delQueryDefinition(queryId)
			}
		},
		get(store)
	)
}

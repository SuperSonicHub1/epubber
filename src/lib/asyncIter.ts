export async function* filter<T>(iterator: AsyncIterable<T>, f: (x: T) => boolean): AsyncIterable<T> {
	for await (const x of iterator) if (f(x)) yield x
}

export async function* map<T, M>(iterator: AsyncIterable<T>, f: (x: T) => M): AsyncIterable<M> {
	for await (const x of iterator) yield f(x)
}

export async function collect<T>(iterator: AsyncIterable<T>): Promise<T[]> {
	const result: T[] = []
	for await (const x of iterator) result.push(x)
	return result
}

export async function* getFileHandlesRecursively(dirHandle: FileSystemDirectoryHandle): AsyncIterable<FileSystemFileHandle> {
	for await (const [, handle] of dirHandle.entries()) {
		switch (handle.kind) {
			case 'file':
				yield handle
				break
			case 'directory':
				yield* getFileHandlesRecursively(handle)
				break
		}
	}
}
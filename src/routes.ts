import Library from "./pages/Library.svelte"
import Book from "./pages/Book.svelte"
import Chapter from "./pages/Chapter.svelte"
import { parse } from 'regexparam'
import Settings from "./pages/Settings.svelte"
import type { SvelteComponent } from "svelte"

export const routes = {
	"/": Library,
	"/book/:bookIdentifier": Book,
	"/book/:bookIdentifier/chapter/:chapterIdentifier": Chapter,
	"/settings": Settings,
}

type Routes = typeof routes

const routeTests = new Map(Object.entries(routes).map(([route, component]) => [route, parse(route)]))

export function matchRoute(location: string): Routes[keyof Routes] | null {
	for (const route of Object.keys(routes)) {
		if (routeTests.get(route).pattern.test(location)) {
			return routes[route]
		}
	}
	return null
}

export const slotPageContentClasses = new Map<typeof SvelteComponent, string>([
	[Library, "p-2 mx-auto w-screen"],
	[Book, "p-2 mx-auto w-screen"],
	[Chapter, "mx-auto w-screen"],
	[Settings, "p-2 mx-auto w-screen"],
])

<script lang="ts">
    import type { SvelteComponent } from 'svelte';
    import Library from '../pages/Library.svelte';
    import { matchRoute } from '../routes';
	import HeaderLibrary from './HeaderLibrary.svelte';
	import { location } from 'svelte-spa-router';
    import Book from '../pages/Book.svelte';
    import HeaderBack from './HeaderBack.svelte';
    import Settings from '../pages/Settings.svelte';
    import HeaderSettings from './HeaderSettings.svelte';
    import { visibleNavigation } from './stores';
    import Chapter from '../pages/Chapter.svelte';
	import { slide } from "svelte/transition"

	const options = new Map<typeof SvelteComponent, typeof SvelteComponent>([
		[Library, HeaderLibrary],
		[Book, HeaderBack],
		[Chapter, HeaderBack],
		[Settings, HeaderSettings],
	])
	let selected: typeof SvelteComponent

	$: {
		selected = options.get(matchRoute($location))
	}
</script>

{#if $visibleNavigation}
	<div transition:slide>
		<svelte:component this={selected} />
	</div>
{/if}

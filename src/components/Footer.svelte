<script lang="ts">
	import type { SvelteComponent } from "svelte";
	import Library from "../pages/Library.svelte";
	import { matchRoute } from "../routes";
	import { location } from "svelte-spa-router";
	import Settings from "../pages/Settings.svelte";
	import FooterNavigation from "./FooterNavigation.svelte";
	import { visibleNavigation } from "./stores";
    import Chapter from "../pages/Chapter.svelte";
    import FooterChapter from "./FooterChapter.svelte";
    import { slide } from "svelte/transition";

	const options = new Map<typeof SvelteComponent, typeof SvelteComponent>([
		[Library, FooterNavigation],
		[Settings, FooterNavigation],
		[Chapter, FooterChapter],
	]);
	let selected: typeof SvelteComponent;

	$: {
		selected = options.get(matchRoute($location));
	}
</script>

{#if $visibleNavigation && selected}
	<div transition:slide>
		<svelte:component this={selected} />
	</div>
{/if}

<script lang="ts">
	import { ProgressBar } from "@skeletonlabs/skeleton";
	import { onDestroy, onMount } from "svelte";
	import type { Book, Rendition } from "epubjs";
	import ScrollPercentage from "./ScrollPercentage.svelte";

	let rendition: Rendition;
	let container: HTMLElement;
	export let percentage: number;
	export let book: Book;
	export let sectionIndex: string;
	export let display: Promise<void>;
	export let onDisplay: (container: HTMLElement) => void;
	let loaded = false;

	const page: HTMLElement = document.querySelector("#page");

	// TODO: Chapter links?
	function fixLinks() {
		document.addEventListener("DOMContentLoaded", () => {
			document.querySelectorAll("a").forEach((a) =>
				a.addEventListener("click", (event) => {
					const href = a.getAttribute('href');
					if (!href) return;
					if (href.startsWith("#")) {
						document.getElementById(href.slice(1)).scrollIntoView();
						event.preventDefault();
					}
				})
			);
		});
	}

	onMount(() => {
		rendition = book.renderTo(container, {
			flow: "scrolled-doc",
			// I wish I could just run my content, but that doesn't seem to be the case
			allowScriptedContent: true,
			script: `data:application/javascript,${encodeURIComponent(
				`${fixLinks}; fixLinks()`
			)}`,
		});
		display = rendition.display(sectionIndex);
		display.then(() => (loaded = true));
		display.then(() => queueMicrotask(() => onDisplay(container)))
	});

	onDestroy(() => {
		rendition.destroy();
	});
</script>

{#await display}
	<div class="p-4 flex flex-col items-center">
		<ProgressBar />
		<p>Loading chapter…</p>
	</div>
{/await}
<ScrollPercentage bind:percentage root={page}>
	<div bind:this={container} class="bg-white" class:pb-4={loaded} />
</ScrollPercentage>

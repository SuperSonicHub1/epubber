<script lang="ts">
	import { ProgressBar, modalStore } from "@skeletonlabs/skeleton";
	import Epub from "../components/Epub.svelte";
	import { createChapterIdentifier, db, getEpub, queries } from "../lib/newLibrary";
	import { cell, componentQuery, row } from "../lib/tinystore";
	import type { Writable } from "svelte/store";
	import { visibleNavigation } from "../components/stores";
	import { onDestroy, onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { inview } from "svelte-inview";
	import { pop, replace, push } from "svelte-spa-router";
    import { objectValues } from "../lib/util";

	export let params: { bookIdentifier: string; chapterIdentifier: string } = {
		bookIdentifier: "",
		chapterIdentifier: "",
	};

	let display: Promise<void>;
	let upNextInView = false;

	const { bookIdentifier, chapterIdentifier } = params;

	const rowId = createChapterIdentifier(bookIdentifier, chapterIdentifier)
	const chapterRow = row(db, "chapters", rowId);
	const bookRow = row(db, "books", bookIdentifier);
	const readingProgress = cell(
		db,
		"chapters",
		rowId,
		"readingProgress"
	) as Writable<number>;
	const initialProgress = $readingProgress === 1 ? 0 : $readingProgress;
	const completed = cell(db, "chapters", rowId, "completed") as Writable<boolean>;
	const notes = cell(db, "chapters", rowId, "notes") as Writable<string>;
	const book = getEpub(bookIdentifier);
	const nextChapterQuery = objectValues(componentQuery(queries, 'chapters', ({ select, where }) => {		
		select('label')
		select('identifier')
		select('bookIdentifier')
		select('index')
		where('bookIdentifier', bookIdentifier)
		where('index', $chapterRow.index + 1)
	}))
	let nextChapter = $nextChapterQuery[0]

	async function takeNotes() {
		const response = await new Promise<boolean>((resolve) => {
			modalStore.trigger({
				type: "component",
				component: "noteTaking",
				meta: {
					chapterRow,
					notes,
				},
				response: resolve,
			});
		});

		if (response === true) {

			$readingProgress = 1;
			$completed = true;
			// TODO: Changing route seems to be broken…
			if (nextChapter) push(`#/book/${encodeURIComponent(bookIdentifier)}/chapter/${encodeURIComponent(nextChapter.identifier)}`)
			else pop()
		}
	}

	// Restore progress
	function onDisplay(container: HTMLElement) {
		const root = document.getElementById("page");
		root.scrollBy({
			top: Math.max(initialProgress - 0.015, 0) * container.getBoundingClientRect().height,
		});
	}

	onMount(() => {
		$visibleNavigation = false;
	});

	onDestroy(() => {
		$visibleNavigation = true;
	});
</script>

{#await book}
	<div class="p-4 flex flex-col items-center">
		<ProgressBar />
		<p>Loading book…</p>
	</div>
{:then book}
	{#if book}
		<Epub
			{book}
			sectionIndex={$chapterRow.sectionIndex}
			bind:display
			bind:percentage={$readingProgress}
			{onDisplay}
		/>
		{#await display}
			<div />
		{:then}
			<!-- TODO: Stop navigation toggle from obstructing 'take notes' button -->
			<label
				class="viewport-center {$visibleNavigation ? 'bg-tertiary-500/50' : ''}"
				style="height: calc(100vh / 3); width: calc(100vw / 3);"
				transition:fade
			>
				<div class="sr-only">
					<p>Toggle navigation:</p>
					<input type="checkbox" bind:checked={$visibleNavigation} />
				</div>
			</label>

			{#if $visibleNavigation && !upNextInView}
				<div transition:fade class="reading-progress">
					<ProgressBar
						label="Reading progress"
						value={$readingProgress}
						max={1}
					/>
				</div>
			{/if}

			<!-- TODO: Should this be a swipe action? -->
			<div
				use:inview
				on:inview_change={({ detail: { inView } }) =>
					(upNextInView = inView)}
				class="flex items-center justify-center flex-col bg-surface-900 text-white"
				style="height: 100vh; z-index: 100000;"
			>
				<button class="btn variant-ghost" on:click={takeNotes}
					>Take Notes</button
				>
				{#if nextChapter}
					<p>
						Up next: {nextChapter.label}
						<!-- TODO: Up next -->
					</p>
				{:else}
					<p>You made it!</p>
				{/if}
			</div>
		{/await}
	{:else}
		<h2>404</h2>
		<p>Book does not exist.</p>
	{/if}
{:catch error}
	<h1>Error</h1>
	<p>{error.message}</p>
{/await}

<script lang="ts">
	import { link } from "svelte-spa-router";
	import { cell, indexRows, row } from "../lib/tinystore";
	import { createChapterIdentifier, db, indexes } from "../lib/newLibrary";
	import { sort, reverse } from "@accuser/svelte-store-array";
	import { keyComparator } from "../lib/util";
	import Icon from "svelte-awesome/components/Icon.svelte";
	import { close, fileText, pencilSquare } from "../components/icons";
	import { Tab, TabGroup } from "@skeletonlabs/skeleton";
    import { popup } from "../lib/popup";

	export let params: { bookIdentifier: string } = { bookIdentifier: "" };
	const { bookIdentifier } = params;
	const book = row(db, "books", bookIdentifier);
	const toc = sort(
		indexRows(indexes, "chaptersByBook", bookIdentifier),
		keyComparator("index")
	);

	const tocChapters = reverse(toc);
	const tocNotes = toc;
	let tabSet: number = 0;
</script>

{#if !book}
	<h1 class="h1">404</h1>
	<p>Book does not exist.</p>
{:else}
	<!-- TODO: Put cover and title/author side-by-side -->
	<!-- {#await book.getCover()}
		<ProgressRadial />
	{:then cover} 
		{#if cover}
			<img src={cover} alt="Cover for {book.title}" class="bg-black/50 w-full" >
		{/if}
	{/await} -->

	<h1 class="h1">{$book.title}</h1>
	<h6 class="h6 text-slate-600">{$book.creator}</h6>

	<!-- TODO: Resume button -->

	<TabGroup justify="justify-center">
		<Tab bind:group={tabSet} name="chapters" value={0}>
			<svelte:fragment slot="lead">
				<Icon data={fileText} />
			</svelte:fragment>
			<span>Chapters</span>
		</Tab>
		<Tab bind:group={tabSet} name="chapters" value={1}>
			<svelte:fragment slot="lead">
				<Icon data={pencilSquare} />
			</svelte:fragment>
			<span>Notes</span>
		</Tab>
		<svelte:fragment slot="panel">
			{#if tabSet === 0}
				<ol class="list">
					<h3 class="h4">
						{$toc.length} chapter{$toc.length == 1 ? "" : "s"}
					</h3>
					<!-- TODO: Add buttons for setting read status  -->
					{#each $tocChapters as chapter (chapter.index)}
						{@const progress = Math.floor(
							chapter.readingProgress * 100
						)}
						{@const target = `popup:${chapter.index}`}
						{@const popupSettings = {
							event: 'contextmenu',
							target,
							placement: 'bottom',
							closeQuery: 'button, input[type=checkbox]',
						}}
						{@const storeArgs = [
							'chapters',
							createChapterIdentifier(bookIdentifier, chapter.identifier),
							'completed',
						]}
						<li class="py-1">
							<a
								use:link
								use:popup={popupSettings}
								href="/book/{encodeURIComponent(
									bookIdentifier
								)}/chapter/{chapter.identifier}"
								class="overflow-hidden whitespace-nowrap text-ellipsis flex-auto"
								class:text-slate-600={chapter.completed}
							>									
								{chapter.label}
							</a>
							{#if !chapter.completed && chapter.readingProgress !== 0 && chapter.readingProgress !== 1}
								<span
									aria-label={`Chapter ${progress}% complete`}
									class="badge variant-filled"
								>
									{progress}%
								</span>
							{/if}
							<div class="card p-4 w-72 shadow-xl" data-popup={target}>
								<section class='flex-auto flex justify-between items-center'>
									<label>
										Completed:
										<input type="checkbox" checked={db.getCell(...storeArgs)} on:change={(e) => {
											const { checked } = e.target
											
											db.setCell(
												...storeArgs,
												!db.getCell(...storeArgs)
											)
										}}>
									</label>
									<button class="btn-icon variant-filled">
										<Icon data={close} />
									</button>
								</section>
							</div>
						</li>
					{/each}
				</ol>
			{:else if tabSet === 1}
				{#each $tocNotes as chapter (chapter.identifier)}
					{#if chapter.notes !== null && chapter.notes !== undefined}
						<h3 class="h4">{chapter.label}</h3>
						<!-- TODO: Add edit button -->
						<article class="whitespace-pre-line">
							{#if chapter.notes.length === 0}
								<p>[blank]</p>
							{:else}
								<p>{chapter.notes}</p>
							{/if}
						</article>
					{/if}
				{/each}
			{/if}
		</svelte:fragment>
	</TabGroup>
{/if}

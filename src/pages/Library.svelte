<script lang="ts">
	import { ProgressBar } from "@skeletonlabs/skeleton";
	import { queries, ongoingScan } from "../lib/newLibrary";
	import { resultTable } from "../lib/tinystore";
	import { objectValues, sortStoreBy } from "../lib/util";
	import { link } from "svelte-spa-router";
	// TODO: Integrate virtual list?

	const library = resultTable(queries, "library");
	const books = sortStoreBy(objectValues(library), "title");
</script>

{#if $ongoingScan !== null}
	<div class="flex flex-col items-center">
		<ProgressBar
			value={$ongoingScan ? $ongoingScan[0] : $ongoingScan}
			max={$ongoingScan ? $ongoingScan[1] : $ongoingScan}
		/>
		<p>Searcing for books…</p>
	</div>
{/if}

{#if $books.length}
	<dl class="list-dl">
		{#each $books as { title, creator, unreadCount, identifier } (identifier)}
			<div>
				<!-- TODO: Cover art -->
				<!-- <span class="badge bg-primary-500">💀</span> -->
				<span class="flex-auto overflow-hidden ">
					<a use:link href="/book/{encodeURIComponent(identifier)}">
						<dt class="overflow-hidden whitespace-nowrap text-ellipsis">
							{title}
						</dt>
						<dd class="overflow-hidden whitespace-nowrap text-ellipsis text-sm text-slate-600">
							{creator}
						</dd>
					</a>
				</span>
				<span
					aria-label={`${unreadCount} unread chapter${
						unreadCount === 1 ? "" : "s"
					}`}
					class="badge variant-filled self-end"
				>
					{unreadCount}
				</span>
			</div>
		{/each}
	</dl>
{:else}
	<!-- TODO: Find an elegant way of centering this message. -->
	<h2 class="h1">No books</h2>
	<p>
		Add some by pressing the "Scan" button in the upper right hand corner.
	</p>
{/if}

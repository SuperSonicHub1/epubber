<!-- https://github.com/skeletonlabs/skeleton/blob/master/sites/skeleton.dev/src/lib/modals/examples/ModalExampleForm.svelte -->
<script lang="ts">
	import { modalStore } from "@skeletonlabs/skeleton";

	export let parent: any;
	let notes = $modalStore[0].meta?.notes;
	let chapter = $modalStore[0].meta?.chapterRow;

	function onFormSubmit() {
		if ($modalStore[0].response) $modalStore[0].response(true);
		modalStore.close();
	}

	$: {
		if ($modalStore[0]) {
			notes = $modalStore[0].meta?.notes;
			chapter = $modalStore[0].meta?.chapterRow;
		}
	}
</script>

{#if $modalStore[0]}
	<div class="card p-4 w-modal shadow-xl space-y-4">
		<header class="text-2xl font-bold">
			Take Notes
		</header>

		<form
			class="modal-form border border-surface-500 p-4 space-y-4 rounded-container-token"
		>
			<label class="label">
				<span>Notes</span>
				<textarea class="textarea" rows="8" bind:value={$notes} />
			</label>
		</form>

		<footer class="modal-footer {parent.regionFooter}">
			<button
				class="btn {parent.buttonNeutral}"
				on:click={parent.onClose}
			>
				{parent.buttonTextCancel}
			</button>
			<button class="btn {parent.buttonPositive}" on:click={onFormSubmit}>
				Save
			</button>
		</footer>
	</div>
{/if}

<script lang="ts">
	import Icon from "svelte-awesome/components/Icon.svelte";
	import { upload, download } from "../components/icons";
	import { checkpoints, db } from "../lib/newLibrary";
    import { toastStore } from "@skeletonlabs/skeleton";
    import { toastError } from "../lib/util";

	/**
	 * https://attacomsian.com/blog/javascript-download-file
	 * https://developer.mozilla.org/en-US/docs/web/http/basics_of_http/data_urls
	 */
	function exportLibrary() {
		const json = db.getJson();
		const anchor = document.createElement("a");
		anchor.href = `data:application/json,${encodeURIComponent(json)}`;
		anchor.download = "library.json";
		anchor.style.visibility = "hidden";

		document.body.appendChild(anchor);
		anchor.click();
		document.body.removeChild(anchor);
	}

	function importLibrary() {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.style.visibility = "hidden";
		fileInput.onchange = async () => {
			try {
				const dateTime = new Date();
				const file = fileInput.files[0];
				checkpoints.addCheckpoint(`import@${dateTime}: begin`);
				db.setJson(await file.text());
				checkpoints.addCheckpoint(`import@${dateTime}: end`);
				toastStore.trigger({
					message: "Import complete!",
					background: "bg-error-500",
				});
			} catch (error) {
				toastError('Import', error)
				checkpoints.goBackward()
			}
		};

		document.body.appendChild(fileInput);
		fileInput.click();
		document.body.removeChild(fileInput);
	}
</script>

<h2 class="h1">Import/Export</h2>

<ul class="list">
	<li>
		<span class="badge-icon variant-soft-secondary">
			<Icon data={upload} />
		</span>
		<span class="flex-auto">
			<button on:click={importLibrary}> Import library </button>
		</span>
	</li>
	<li>
		<span class="badge-icon variant-soft-secondary">
			<Icon data={download} />
		</span>
		<span class="flex-auto">
			<button on:click={exportLibrary}> Export library </button>
		</span>
	</li>
</ul>

<script lang="ts">
    import { AppBar } from "@skeletonlabs/skeleton";
    import Icon from "svelte-awesome/components/Icon.svelte";
    import { rotateRight } from "./icons";
    import { scanDirectory } from "../lib/newLibrary";
</script>

<AppBar gridColumns="grid-cols-2" slotDefault="place-self-beginning" slotTrail="place-content-end" class="w-full">
	<h1 class="h1">Library</h1>
	<svelte:fragment slot="trail">
		<button aria-label="Scan" class="btn-icon" on:click={scanDirectory}>
			<Icon data={rotateRight} />
		</button>
	</svelte:fragment>
</AppBar>

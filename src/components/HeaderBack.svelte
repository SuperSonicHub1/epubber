<script lang="ts">
    import { AppBar } from "@skeletonlabs/skeleton";
    import Icon from "svelte-awesome/components/Icon.svelte";
    import { arrowLeft } from "./icons";
    import { pop } from "svelte-spa-router";
</script>

<AppBar gridColumns="grid-cols-2" class="w-full">
	<svelte:fragment slot="lead">
		<button aria-label="Back" class="btn-icon" on:click={pop}>
			<Icon data={arrowLeft} />
		</button>
	</svelte:fragment>
</AppBar>

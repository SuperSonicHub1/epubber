<script lang="ts">
	import { location } from "svelte-spa-router";
    import { TabAnchor, TabGroup } from "@skeletonlabs/skeleton";
    import Icon from "svelte-awesome/components/Icon.svelte";
	import { book, gear } from "./icons";
</script>

<TabGroup
	justify="justify-center"
	active="variant-filled-primary"
	hover="hover:variant-soft-primary"
	flex="flex-1 lg:flex-none"
	rounded=""
	border=""
	class="bg-surface-100-800-token w-full"
>
	<TabAnchor href="#/" selected={$location === "/"}>
		<svelte:fragment slot="lead">
			<Icon data={book} />
		</svelte:fragment>
		<span>Library</span>
	</TabAnchor>
	<TabAnchor href="#/settings" selected={$location === "/settings"}>
		<svelte:fragment slot="lead">
			<Icon data={gear} />
		</svelte:fragment>
		<span>Settings</span>
	</TabAnchor>
</TabGroup>

<script lang="ts">
	import "@skeletonlabs/skeleton/themes/theme-skeleton.css";
	import "@skeletonlabs/skeleton/styles/skeleton.css";
	import "./app.postcss";

	import {
		AppShell,
		Modal,
		Toast,
		autoModeWatcher,
		type ModalComponent,
	} from "@skeletonlabs/skeleton";
	import Router, { location } from "svelte-spa-router";
	
	import { matchRoute, routes, slotPageContentClasses } from "./routes";
	import { directoryHandle, setDirectory } from "./lib/newLibrary";
	import Header from "./components/Header.svelte";
	import Footer from "./components/Footer.svelte";
	import NoteTakingModal from "./components/NoteTakingModal.svelte";


	import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom'
	import { storePopup } from '@skeletonlabs/skeleton'
	storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow })

	let slotPageContentClass: string;
	
	const modalComponentRegistry: Record<string, ModalComponent> = {
		noteTaking: {
			ref: NoteTakingModal,
		},
	};

	$: {
		slotPageContentClass = slotPageContentClasses.get(
			matchRoute($location)
		);
	}
</script>

<svelte:head>
	{@html `<script>${autoModeWatcher.toString()} autoModeWatcher();</script>`}
</svelte:head>

<Modal components={modalComponentRegistry} />
<Toast />

<AppShell
	slotPageContent={!$directoryHandle
		? "flex items-center justify-center flex-col"
		: slotPageContentClass}
>
	<nav slot="header">
		{#if $directoryHandle}
			<Header />
		{/if}
	</nav>

	<slot>
		{#if $directoryHandle}
			<Router {routes} restoreScrollState={true} />
		{:else}
			<button class="btn btn-xl variant-filled" on:click={setDirectory}>
				Open Library Directory
			</button>
			<p class="py-2">This is the folder where you store your books.</p>
			<p>EPUB support only for now.</p>
		{/if}
	</slot>

	<nav slot="footer">
		{#if $directoryHandle}
			<Footer />
		{/if}
	</nav>
</AppShell>

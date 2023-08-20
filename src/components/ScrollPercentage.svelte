<!-- https://github.com/thebuilder/react-scroll-percentage/blob/master/src/ScrollPercentage.tsx -->
<!-- https://www.npmjs.com/package/svelte-inview -->
<!-- https://svelte.dev/docs/special-elements#svelte-element -->

<script lang="ts">
	/**
	 * Based on ScrollPercentage: https://github.com/thebuilder/react-scroll-percentage/blob/8407314bae561c8d35bdd53f5b6fe1126945c2dc/src/ScrollPercentage.tsx
	 * @license MIT
	 */

	import { inview } from "svelte-inview";
	import { onDestroy } from "svelte";

	export let tag: string = "div";
	export let percentage: number;
	export let threshold: number = 0;
	export let root: Window | Element | null | undefined = window;
	export let horizontal: boolean = false;
	let node: Element | null = undefined;

	/**
	 * See https://github.com/thebuilder/react-scroll-percentage/blob/8407314bae561c8d35bdd53f5b6fe1126945c2dc/src/utils.ts#L1-L14
	 * @license MIT
	 */
	function calculateVerticalPercentage(
		bounds: ClientRect,
		threshold: number = 0,
		root: Window | Element | null | undefined = window
	) {
		if (!root) return 0;
		const vh =
			(root instanceof Element ? root.clientHeight : root.innerHeight) ||
			0;
		const offset = threshold * bounds.height;
		const percentage =
			(bounds.bottom - offset) / (vh + bounds.height - offset * 2);

		return 1 - Math.max(0, Math.min(1, percentage));
	}

	/**
	 * See https://github.com/thebuilder/react-scroll-percentage/blob/8407314bae561c8d35bdd53f5b6fe1126945c2dc/src/utils.ts#L16-L27
	 * @license MIT
	 */
	function calculateHorizontalPercentage(
		bounds: ClientRect,
		threshold: number = 0,
		root: Window | Element | null | undefined = window
	) {
		if (!root) return 0;
		const vw =
			(root instanceof Element ? root.clientWidth : root.innerWidth) || 0;
		const offset = threshold * bounds.width;
		const percentage =
			(bounds.right - offset) / (vw + bounds.width - offset * 2);

		return 1 - Math.max(0, Math.min(1, percentage));
	}

	function handleScroll() {
		if (!node) return;
		const bounds = node.getBoundingClientRect();
		percentage = horizontal
			? calculateHorizontalPercentage(
					bounds,
					threshold,
					root
			  )
			: calculateVerticalPercentage(
					bounds,
					threshold,
					root
			  );
	}

	// Elements can resize, too!
	const resizeObserver = new ResizeObserver(handleScroll)
	function monitorScroll(enabled: boolean) {
		if (enabled) {
			root.addEventListener("scroll", handleScroll, { passive: true });
			if (root instanceof Window) {
				root.addEventListener("resize", handleScroll);
			} else {
				resizeObserver.observe(root)
			}
			handleScroll();
		} else {
			root.removeEventListener("scroll", handleScroll);
			if (root instanceof Window) {
				root.removeEventListener("resize", handleScroll);
			} else {
				resizeObserver.unobserve(root)
			}
		}
	}

	function onInViewChange(event: CustomEvent<ObserverEventDetails>) {
		const { inView, entry } = event.detail;
		node = entry.target;
		monitorScroll(inView);
	}

	onDestroy(() => {
		monitorScroll(false);
	});
</script>

<svelte:element this={tag} use:inview on:inview_change={onInViewChange}>
	<slot />
</svelte:element>

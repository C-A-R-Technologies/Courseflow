<script lang="ts">
	import { page } from "$app/state";
	import { locales, localizeHref } from "$lib/paraglide/runtime";
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import Header from "$lib/components/header.svelte";
	import { Toaster } from "$lib/components/ui/sonner/index";

	let { children, data } = $props();
	let user = $derived(data.user);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Toaster position="bottom-right" richColors />

<div class="bg-background">
	<Header {user} />
	{@render children()}
</div>

<div style="display:none">
	{#each locales as locale}
		<a href={localizeHref(page.url.pathname, { locale })}>
			{locale}
		</a>
	{/each}
</div>

<footer
	class="border-t border-border py-10 text-center text-sm text-muted-foreground"
>
	<p>&copy; 2026 Courseflow. All rights reserved.</p>
	<p class="mt-1">
		Courseflow is a SNHU capstone project by Avery, Cam, and Rikuto.
	</p>
</footer>

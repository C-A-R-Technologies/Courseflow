<script lang="ts">
    import type { PageProps } from "./$types";
    import { Button } from "$lib/components/ui/button/index";
    import TextFadeIn from "$lib/components/text-fade-in.svelte";
    const { data }: PageProps = $props();
</script>

<div class="flex flex-col justify-center items-center h-screen">
    <TextFadeIn
        text="Welcome to Courseflow"
        tag="h1"
        class="text-6xl font-bold"
    />
    <TextFadeIn
        text="Course evaluation, reimagined."
        tag="h4"
        class="text-2xl italic"
    />
    <div class="">
        <Button href="/login" variant="default" class="mt-6"
            >University Login</Button
        >
        <Button href="/about" variant="secondary" class="mt-6"
            >Learn More</Button
        >
    </div>
</div>

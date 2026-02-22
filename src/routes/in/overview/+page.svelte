<script lang="ts">
    import type { PageProps } from "./$types";
    import * as Card from "$lib/components/ui/card/index.js";

    const { data }: PageProps = $props();
    const user = $derived(data.user);
</script>

<div class="min-h-screen flex flex-col items-start justify-center p-4">
    <div class="w-[40%]">
        <div class="text-left mb-4">
            {#if new Date().getHours() < 12}
                <h1 class="text-4xl font-bold mb-4">
                    Good morning, {user.firstname}
                </h1>
            {:else if new Date().getHours() < 18}
                <h1 class="text-4xl font-bold mb-4">
                    Good afternoon, {user.firstname}
                </h1>
            {:else}
                <h1 class="text-4xl font-bold mb-4">
                    Good evening, {user.firstname}
                </h1>
            {/if}
        </div>
        <div class="w-full">
            <Card.Root class="w-full">
                <Card.Description>
                    This is your dashboard. Here you can view your courses,
                    evaluations, and more.
                </Card.Description>
            </Card.Root>
        </div>
    </div>
</div>

<script lang="ts">
    import type { PageProps } from "./$types";
    import StudentOverview from "./student-overview.svelte";
    import FacultyOverview from "./faculty-overview.svelte";

    const { data }: PageProps = $props();
    const user = $derived(data.user);
</script>

<div class="min-h-screen flex flex-col items-start p-8 md:p-12 max-w-5xl">
    {#if user.role === "faculty"}
        <FacultyOverview {user} />
    {:else}
        <StudentOverview {user} />
    {/if}
</div>

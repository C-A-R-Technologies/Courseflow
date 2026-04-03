<script lang="ts">
    import type { PageProps } from "./$types";
    import type {
        StudentCourseOverview,
        FacultyCourseOverview
    } from "$lib/models";
    import StudentOverview from "./student-overview.svelte";
    import FacultyOverview from "./faculty-overview.svelte";

    const { data }: PageProps = $props();
</script>

<div class="flex flex-col items-start p-8 md:p-12 max-w-5xl">
    {#if data.user.role === "instructor"}
        <FacultyOverview user={data.user} />
    {:else if data.user.role === "student"}
        <StudentOverview
            user={data.user}
            term={data.term}
            courseOverviews={data.courseOverviews as StudentCourseOverview[]}
        />
    {:else}
        <p class="text-muted-foreground">No overview available. Please report this issue to our team.</p>
    {/if}
</div>

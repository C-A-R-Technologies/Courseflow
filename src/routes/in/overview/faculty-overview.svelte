<script lang="ts">
    import type { User } from "$lib/models";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Progress } from "$lib/components/ui/progress/index.js";

    const { user }: { user: User } = $props();

    // Placeholder data — replace with real data once backend is wired up
    const courses = [
        {
            id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            course: "CS-350: Emerging Systems Architecture",
            section: "J7642",
            enrolled: 28,
            responsesReceived: 22,
            evaluationStatus: "active" as const,
            dueDate: "Mar 14, 2026",
        },
        {
            id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
            course: "CS-230: Operating Platforms",
            section: "H9153",
            enrolled: 32,
            responsesReceived: 0,
            evaluationStatus: "upcoming" as const,
            dueDate: "April 13, 2026",
        },
    ];

    const pastCourses = [
        {
            id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
            course: "CS-350: Emerging Systems Architecture",
            section: "G4821",
            enrolled: 25,
            responsesReceived: 19,
            term: "Fall 2025",
        },
    ];

    function completionPercent(received: number, enrolled: number): number {
        if (enrolled === 0) return 0;
        return Math.round((received / enrolled) * 100);
    }

    const totalEnrolled = courses.reduce((sum, c) => sum + c.enrolled, 0);
    const totalResponses = courses.reduce(
        (sum, c) => sum + c.responsesReceived,
        0,
    );
    const overallCompletion = completionPercent(totalResponses, totalEnrolled);
</script>

<div class="mb-8">
    {#if new Date().getHours() < 12}
        <h1 class="text-4xl font-bold">Good morning, {user.firstname}</h1>
    {:else if new Date().getHours() < 18}
        <h1 class="text-4xl font-bold">
            Good afternoon, {user.firstname}
        </h1>
    {:else}
        <h1 class="text-4xl font-bold">Good evening, {user.firstname}</h1>
    {/if}
    <p class="text-muted-foreground mt-1">
        Here's an overview of your course evaluations this term.
    </p>
</div>

<!-- Term Stats -->
<section class="w-full mb-10">
    <h2 class="text-xl font-semibold mb-3">Term Overview</h2>
    <div class="grid gap-4 sm:grid-cols-3">
        <Card.Root>
            <Card.Header>
                <Card.Description>Current Term</Card.Description>
                <Card.Title class="text-3xl">Spring 2026 (A1)</Card.Title>
            </Card.Header>
        </Card.Root>
        <Card.Root>
            <Card.Header>
                <Card.Description>Active Sections</Card.Description>
                <Card.Title class="text-3xl">{courses.length}</Card.Title>
            </Card.Header>
        </Card.Root>
        <Card.Root>
            <Card.Header>
                <Card.Description>Overall Response Rate</Card.Description>
                <Card.Title class="text-3xl">{overallCompletion}%</Card.Title>
            </Card.Header>
            <Card.Content>
                <Progress value={overallCompletion} class="h-2" />
                <p class="text-xs text-muted-foreground mt-1">
                    {totalResponses} of {totalEnrolled} students responded
                </p>
            </Card.Content>
        </Card.Root>
    </div>
</section>

<!-- Current Courses -->
<section class="w-full mb-10">
    <h2 class="text-xl font-semibold mb-3">Your Courses</h2>
    {#if courses.length === 0}
        <Card.Root>
            <Card.Content class="py-8 text-center">
                <p class="text-muted-foreground">
                    No courses assigned this term.
                </p>
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="grid gap-4">
            {#each courses as course}
                {@const pct = completionPercent(
                    course.responsesReceived,
                    course.enrolled,
                )}
                <Card.Root
                    class="transition-colors hover:border-primary/40"
                    onclick={() =>
                        (window.location.href = `/in/courses/${course.id}`)}
                >
                    <Card.Header>
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <Card.Title>{course.course}</Card.Title>
                                <Card.Description>
                                    Section {course.section} &middot;
                                    {course.enrolled} students enrolled
                                </Card.Description>
                            </div>
                            <div class="text-right shrink-0">
                                {#if course.evaluationStatus === "active"}
                                    <span
                                        class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400"
                                    >
                                        <span
                                            class="inline-block h-1.5 w-1.5 rounded-full bg-green-500"
                                        ></span>
                                        Evaluation Active
                                    </span>
                                {:else}
                                    <span
                                        class="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                                    >
                                        Opens {course.dueDate}
                                    </span>
                                {/if}
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Content>
                        <div class="flex items-center gap-3">
                            <Progress value={pct} class="h-2 flex-1" />
                            <span
                                class="text-sm font-medium tabular-nums w-10 text-right"
                                >{pct}%</span
                            >
                        </div>
                        <p class="text-xs text-muted-foreground mt-1">
                            {course.responsesReceived} of {course.enrolled} responses
                            received
                        </p>
                    </Card.Content>
                </Card.Root>
            {/each}
        </div>
    {/if}
</section>

<Separator class="mb-10" />

<!-- Past Courses -->
<section class="w-full mb-10">
    <h2 class="text-xl font-semibold mb-3">Past Terms</h2>
    {#if pastCourses.length === 0}
        <Card.Root>
            <Card.Content class="py-8 text-center">
                <p class="text-muted-foreground">
                    No past evaluation data yet.
                </p>
            </Card.Content>
        </Card.Root>
    {:else}
        <div class="grid gap-4 sm:grid-cols-2">
            {#each pastCourses as course}
                {@const pct = completionPercent(
                    course.responsesReceived,
                    course.enrolled,
                )}
                <Card.Root
                    class="opacity-80 transition-colors hover:border-primary/40"
                    onclick={() =>
                        (window.location.href = `/in/courses/${course.id}`)}
                >
                    <Card.Header>
                        <Card.Title>{course.course}</Card.Title>
                        <Card.Description>
                            Section {course.section} &middot; {course.term}
                        </Card.Description>
                    </Card.Header>
                    <Card.Content>
                        <div class="flex items-center gap-3">
                            <Progress value={pct} class="h-2 flex-1" />
                            <span
                                class="text-sm font-medium tabular-nums w-10 text-right"
                                >{pct}%</span
                            >
                        </div>
                        <p class="text-xs text-muted-foreground mt-1">
                            {course.responsesReceived} of {course.enrolled} responses
                            &middot; Final
                        </p>
                    </Card.Content>
                </Card.Root>
            {/each}
        </div>
    {/if}
</section>

<!-- Info card -->
<section class="w-full mb-10">
    <Card.Root class="bg-muted/50">
        <Card.Header>
            <Card.Title class="text-base">About course evaluations</Card.Title>
        </Card.Header>
        <Card.Content>
            <p class="text-sm text-muted-foreground leading-relaxed">
                Evaluation questions are managed by the department. You can view
                anonymized student responses once the evaluation period closes and final grades are submitted.
                Response data helps identify areas for improvement and is used
                during annual reviews. Individual student identities are never
                disclosed.
            </p>
        </Card.Content>
    </Card.Root>
</section>

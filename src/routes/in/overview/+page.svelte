<script lang="ts">
    import type { PageProps } from "./$types";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Progress } from "$lib/components/ui/progress/index.js";
    import { redirect } from "@sveltejs/kit";
    import { toast } from "svelte-sonner";

    const { data }: PageProps = $props();
    const user = $derived(data.user);

    const activeEvaluations: {
        id: string;
        course: string;
        section: string;
        dueDate: string;
        instructor: string;
    }[] = [
        {
            id: "24a6b4d5-82a2-48af-bbab-1cee6b933f80",
            course: "Test course",
            section: "00000",
            dueDate: "April 13, 2026",
            instructor: "Swapnil Chhabra",
        },
    ];

    const upcomingEvaluations = [
        {
            id: "6e72a314-a44d-4299-942f-5e24f1aae3f1",
            course: "CS-414: Software Engineer Project II",
            section: "11124",
            opensDate: "April 13, 2026",
            instructor: "Swapnil Chhabra",
        },
    ];

    const pastEvaluations = [
        {
            id: "b3f22cdf-f7a8-4c91-98f0-fafc504d6bca",
            course: "CS-465: Software Testing & QA",
            section: "11121",
            completedDate: "Dec 15, 2025",
            instructor: "Charles Palmer",
            submitted: true,
        },
    ];
</script>

<div class="min-h-screen flex flex-col items-start p-8 md:p-12 max-w-5xl">
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
            Here's an overview of your course evaluations.
        </p>
    </div>

    {#if activeEvaluations.length > 0}
        <section class="w-full mb-10">
            <h2 class="text-xl font-semibold mb-3 flex items-center gap-2">
                <span class="inline-block h-2 w-2 rounded-full bg-green-500"
                ></span>
                Avaliable Evaluations
            </h2>
            <div class="grid gap-4 sm:grid-cols-2">
                {#each activeEvaluations as evaluation}
                    <Card.Root
                        class="border-green-500/30 transition-colors hover:border-green-500/60"
                        onclick={() =>
                            (window.location.href = `/in/evaluation/${evaluation.id}`)}
                    >
                        <Card.Header>
                            <Card.Title>{evaluation.course}</Card.Title>
                            <Card.Description>
                                Section {evaluation.section} &middot;
                                {evaluation.instructor}
                            </Card.Description>
                        </Card.Header>
                        <Card.Footer>
                            <span
                                class="text-sm font-medium text-green-600 dark:text-green-400"
                            >
                                Due {evaluation.dueDate}
                            </span>
                        </Card.Footer>
                    </Card.Root>
                {/each}
            </div>
        </section>
    {/if}

    <section class="w-full mb-10">
        <h2 class="text-xl font-semibold mb-3">Upcoming Evaluations</h2>
        {#if upcomingEvaluations.length === 0}
            <Card.Root>
                <Card.Content class="py-8 text-center">
                    <p class="text-muted-foreground">
                        No upcoming evaluations right now.
                    </p>
                </Card.Content>
            </Card.Root>
        {:else}
            <div class="grid gap-4 sm:grid-cols-2">
                {#each upcomingEvaluations as evaluation}
                    <Card.Root
                        class="transition-colors hover:border-primary/40"
                        onclick={() => toast.warning("Evaluation not open yet")}
                    >
                        <Card.Header>
                            <Card.Title>{evaluation.course}</Card.Title>
                            <Card.Description>
                                Section {evaluation.section} &middot;
                                {evaluation.instructor}
                            </Card.Description>
                        </Card.Header>
                        <Card.Footer>
                            <span class="text-sm text-muted-foreground">
                                Opens {evaluation.opensDate}
                            </span>
                        </Card.Footer>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </section>

    <section class="w-full mb-10">
        <h2 class="text-xl font-semibold mb-3">Past Evaluations</h2>
        {#if pastEvaluations.length === 0}
            <Card.Root>
                <Card.Content class="py-8 text-center">
                    <p class="text-muted-foreground">
                        No past evaluations yet.
                    </p>
                </Card.Content>
            </Card.Root>
        {:else}
            <div class="grid gap-4 sm:grid-cols-2">
                {#each pastEvaluations as evaluation}
                    <Card.Root class="opacity-80">
                        <Card.Header>
                            <Card.Title class="flex items-center gap-2">
                                {evaluation.course}
                                {#if evaluation.submitted}
                                    <span
                                        class="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                                    >
                                        Submitted
                                    </span>
                                {:else}
                                    <span
                                        class="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                    >
                                        Missed
                                    </span>
                                {/if}
                            </Card.Title>
                            <Card.Description>
                                Section {evaluation.section} &middot;
                                {evaluation.instructor}
                            </Card.Description>
                        </Card.Header>
                        <Card.Footer>
                            <span class="text-sm text-muted-foreground">
                                Completed {evaluation.completedDate}
                            </span>
                        </Card.Footer>
                    </Card.Root>
                {/each}
            </div>
        {/if}
    </section>

    <Separator class="mb-10" />

    <section class="w-full mb-10">
        <h2 class="text-xl font-semibold mb-3">Your Stats</h2>
        <div class="grid gap-4 sm:grid-cols-3">
            <Card.Root>
                <Card.Header>
                    <Card.Description>Evaluations Completed</Card.Description>
                    <Card.Title class="text-3xl"
                        >1 <span class="text-lg">(0 missed)</span></Card.Title
                    >
                </Card.Header>
            </Card.Root>
            <Card.Root>
                <Card.Header>
                    <Card.Description>Completion Rate</Card.Description>
                    <Card.Title class="text-3xl">100%</Card.Title>
                </Card.Header>
                <Card.Content>
                    <Progress value={100} class="h-2" />
                </Card.Content>
            </Card.Root>
            <Card.Root>
                <Card.Header>
                    <Card.Description>Current Term</Card.Description>
                    <Card.Title class="text-3xl">Spring 2026 (A1)</Card.Title>
                </Card.Header>
            </Card.Root>
        </div>
    </section>

    <section class="w-full mb-10">
        <Card.Root class="bg-muted/50">
            <Card.Header>
                <Card.Title class="text-base">
                    Why evaluations matter
                </Card.Title>
            </Card.Header>
            <Card.Content>
                <p class="text-sm text-muted-foreground leading-relaxed">
                    Course evaluations directly influence how courses are taught
                    in future terms. Your honest, constructive feedback helps
                    instructors improve their teaching and helps the university
                    shape a better learning experience for everyone. All
                    responses are anonymous.
                </p>
            </Card.Content>
        </Card.Root>
    </section>
</div>

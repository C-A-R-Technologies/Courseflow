<script lang="ts">
    import type { User, Term, StudentCourseOverview } from "$lib/models";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import { Progress } from "$lib/components/ui/progress/index.js";
    import * as Collapsible from "$lib/components/ui/collapsible/index.js";
    import { toast } from "svelte-sonner";
    import ChevronRight from "@lucide/svelte/icons/chevron-right";
    import { termIsSpring } from "$lib/utils";
    import { getActiveEnrollments } from "$lib/functions/enrollments.remote";

    interface Props {
        user: User;
        term: Term | null;
        courseOverviews: StudentCourseOverview[];
    }

    const { user, term, courseOverviews }: Props = $props();
    let currentEvaluations = $state<StudentCourseOverview[]>([]);
    let upcomingEvaluations = $state<StudentCourseOverview[]>([]);
    let pastEvaluations = $state<StudentCourseOverview[]>([]);
    let completedAmount = $state(0);
    let completedRate = $state(0.0);
    let termDaysLeft = $state(0);
    let activeEnrollments = $state(0);

    $effect(() => {
        const allEvaluations: StudentCourseOverview[] = courseOverviews.map(
            (overview) => {
                return {
                    section_id: overview.section_id,
                    section_code: overview.section_code,
                    course_id: overview.course_id,
                    course_name: overview.course_name,
                    instructor_name: overview.instructor_name,
                    evaluation_form_id: overview.evaluation_form_id,
                    evaluation_form_opens_at: overview.evaluation_form_opens_at,
                    evaluation_form_closes_at:
                        overview.evaluation_form_closes_at,
                    evaluation_completed: overview.evaluation_completed,
                    evaluation_completed_at: overview.evaluation_completed_at,
                };
            },
        );

        currentEvaluations = allEvaluations.filter((evaluation) => {
            const openDate = new Date(evaluation.evaluation_form_opens_at);
            const dueDate = new Date(evaluation.evaluation_form_closes_at);
            const now = new Date();
            return dueDate >= now && openDate <= now;
        });

        upcomingEvaluations = allEvaluations.filter((evaluation) => {
            const openDate = new Date(evaluation.evaluation_form_opens_at);
            const dueDate = new Date(evaluation.evaluation_form_closes_at);
            const now = new Date();
            return openDate > now;
        });

        pastEvaluations = allEvaluations.filter((evaluation) => {
            const dueDate = new Date(evaluation.evaluation_form_closes_at);
            const now = new Date();
            return dueDate < now;
        });

        if (courseOverviews.length > 0) {
            completedAmount = courseOverviews.filter(
                (c) => c.evaluation_completed,
            ).length;
            completedRate = Math.round(
                (completedAmount / courseOverviews.length) * 100,
            );
        } else {
            completedAmount = 0;
            completedRate = 0;
        }

        if (term) {
            const now = new Date();
            const termEnd = new Date(term.ends_at);
            const timeDiff = termEnd.getTime() - now.getTime();
            termDaysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

            getActiveEnrollments({ userId: user.id, termId: term.id }).then(
                (count) => {
                    activeEnrollments = count;
                    console.log(`Active enrollments: ${count}`);
                },
            );
        }
    });
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
        Here's an overview of your course evaluations.
    </p>
</div>

{#if currentEvaluations.length > 0}
    <section class="w-full mb-10">
        <h2 class="text-xl font-semibold mb-3 flex items-center gap-2">
            <span class="inline-block h-2 w-2 rounded-full bg-green-500"></span>
            Available Evaluations
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
            {#each currentEvaluations as evaluation}
                <Card.Root
                    class="border-green-500/20 transition-colors hover:border-green-500"
                    onclick={() =>
                        (window.location.href = `/in/courses/${evaluation.section_id}/eval`)}
                >
                    <Card.Header class="select-none">
                        <Card.Title>{evaluation.course_name}</Card.Title>
                        <Card.Description>
                            Section {evaluation.section_code} &middot;
                            {evaluation.instructor_name}
                        </Card.Description>
                    </Card.Header>
                    <Card.Footer>
                        <span
                            class="text-sm select-none font-medium text-green-600 dark:text-green-400"
                        >
                            Due {new Date(
                                evaluation.evaluation_form_closes_at,
                            ).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                            })} @ {new Date(
                                evaluation.evaluation_form_closes_at,
                            ).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </Card.Footer>
                </Card.Root>
            {/each}
        </div>
    </section>
{/if}

<section class="w-full mb-10">
    <Collapsible.Root open={true}>
        <Collapsible.Trigger
            class="flex items-center gap-2 mb-3 group cursor-pointer"
        >
            <ChevronRight
                class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90"
            />
            <h2 class="text-xl font-semibold">Upcoming Evaluations</h2>
        </Collapsible.Trigger>
        <Collapsible.Content>
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
                            onclick={() =>
                                toast.warning(
                                    `Evaluation for ${evaluation.course_name}\nisn't open yet`,
                                )}
                        >
                            <Card.Header>
                                <Card.Title>{evaluation.course_name}</Card.Title
                                >
                                <Card.Description>
                                    Section {evaluation.section_code} &middot;
                                    {evaluation.instructor_name}
                                </Card.Description>
                            </Card.Header>
                            <Card.Footer>
                                <span class="text-sm text-muted-foreground">
                                    Opens {new Date(
                                        evaluation.evaluation_form_opens_at,
                                    ).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                    })} @ {new Date(
                                        evaluation.evaluation_form_opens_at,
                                    ).toLocaleTimeString(undefined, {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </Card.Footer>
                        </Card.Root>
                    {/each}
                </div>
            {/if}
        </Collapsible.Content>
    </Collapsible.Root>
</section>

<section class="w-full mb-10">
    <Collapsible.Root open={false}>
        <Collapsible.Trigger
            class="flex items-center gap-2 mb-3 group cursor-pointer"
        >
            <ChevronRight
                class="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90"
            />
            <h2 class="text-xl font-semibold">Past Evaluations</h2>
        </Collapsible.Trigger>
        <Collapsible.Content>
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
                        <Card.Root
                            class="opacity-80"
                            onclick={() =>
                                toast.warning(
                                    `You've already submitted an evaluation for ${evaluation.course_name}`,
                                )}
                        >
                            <Card.Header>
                                <Card.Title class="flex items-center gap-2">
                                    {evaluation.course_name}
                                    {#if evaluation.evaluation_completed}
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
                                    Section {evaluation.section_code} &middot;
                                    {evaluation.instructor_name}
                                </Card.Description>
                            </Card.Header>
                            <Card.Footer>
                                {#if evaluation.evaluation_completed_at}
                                    <span class="text-sm text-muted-foreground">
                                        Completed {new Date(
                                            evaluation.evaluation_completed_at,
                                        ).toLocaleDateString(undefined, {
                                            month: "short",
                                            day: "numeric",
                                        })} @ {new Date(
                                            evaluation.evaluation_completed_at,
                                        ).toLocaleTimeString(undefined, {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                {:else}
                                    <span class="text-sm text-muted-foreground">
                                        Not yet submitted
                                    </span>
                                {/if}
                            </Card.Footer>
                        </Card.Root>
                    {/each}
                </div>
            {/if}
        </Collapsible.Content>
    </Collapsible.Root>
</section>

<Separator class="mb-10" />

<section class="w-full mb-10">
    <h2 class="text-xl font-semibold mb-3">Your Stats</h2>
    <div class="grid gap-4 sm:grid-cols-4">
        <Card.Root>
            <Card.Header>
                <Card.Description>Enrolled courses</Card.Description>
                <Card.Title class="text-3xl">{activeEnrollments}</Card.Title>
            </Card.Header>
        </Card.Root>
        <Card.Root>
            <Card.Header>
                <Card.Description>Evaluations Completed</Card.Description>
                {#if courseOverviews.length === 0}
                    <Card.Title class="text-3xl">0</Card.Title>
                {:else}
                    <Card.Title class="text-3xl">
                        {courseOverviews.filter((c) => c.evaluation_completed)
                            .length}
                        <span class="text-lg">
                            ({pastEvaluations.length -
                                pastEvaluations.filter(
                                    (c) => c.evaluation_completed,
                                ).length} missed)</span
                        >
                    </Card.Title>
                {/if}
            </Card.Header>
        </Card.Root>
        <Card.Root>
            <Card.Header>
                <Card.Description>Completion Rate</Card.Description>
                <Card.Title class="text-3xl"
                    >{completedRate > 0 ? completedRate : "N/A"}%</Card.Title
                >
            </Card.Header>
            <Card.Content class="-mt-4">
                <Progress value={completedRate} class="h-2" />
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Header>
                <Card.Description>Current Term</Card.Description>
                {#if term}
                    <Card.Title class="text-3xl">
                        {termIsSpring(term) ? "Spring" : "Fall"} 2026 (A1)
                        <br />
                        <span class="text-xl text-muted-foreground">
                            {termDaysLeft} days left</span
                        >
                    </Card.Title>
                {:else}
                    <Card.Title class="text-3xl"
                        >No active or upcoming term</Card.Title
                    >
                {/if}
            </Card.Header>
        </Card.Root>
    </div>
</section>

<section class="w-full mb-10">
    <Card.Root class="bg-muted/50">
        <Card.Header>
            <Card.Title class="text-base">Why evaluations matter</Card.Title>
        </Card.Header>
        <Card.Content>
            <p class="text-sm text-muted-foreground leading-relaxed">
                Course evaluations directly influence how courses are taught in
                future terms. Your honest, constructive feedback helps
                instructors improve their teaching and helps SNHU shape a better
                learning experience for everyone. All responses are anonymous.
            </p>
        </Card.Content>
    </Card.Root>
</section>

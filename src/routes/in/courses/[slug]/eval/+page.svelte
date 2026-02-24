<script lang="ts">
    import { Slider } from "$lib/components/ui/slider/index";
    import { Button } from "$lib/components/ui/button/index";
    import { Textarea } from "$lib/components/ui/textarea/index";
    import * as Card from "$lib/components/ui/card";
    import { Progress } from "$lib/components/ui/progress/index";
    import { toast } from "svelte-sonner";

    const questions = [
        {
            id: "overall",
            label: "Overall Course Quality",
            description: "How would you rate this course overall?",
            lowLabel: "Poor",
            highLabel: "Excellent",
        },
        {
            id: "instructor",
            label: "Instructor Effectiveness",
            description:
                "How effective was the instructor at teaching the material?",
            lowLabel: "Ineffective",
            highLabel: "Outstanding",
        },
        {
            id: "materials",
            label: "Course Materials",
            description: "How useful were the course materials and resources?",
            lowLabel: "Not useful",
            highLabel: "Extremely useful",
        },
        {
            id: "recommend",
            label: "Likelihood to Recommend",
            description:
                "How likely are you to recommend this course to a peer?",
            lowLabel: "Not likely",
            highLabel: "Very likely",
        },
    ];

    let answers: Record<string, number[]> = $state(
        Object.fromEntries(questions.map((q) => [q.id, [5]])),
    );

    let comment = $state("");
    let submitted = $state(false);
    let currentStep = $state(0);
    const totalSteps = questions.length + 1; // questions + review

    function ratingLabel(value: number): string {
        if (value <= 2) return "Poor";
        if (value <= 4) return "Below Average";
        if (value <= 6) return "Average";
        if (value <= 8) return "Good";
        return "Excellent";
    }

    function ratingColor(value: number): string {
        if (value <= 2) return "text-red-500";
        if (value <= 4) return "text-orange-500";
        if (value <= 6) return "text-yellow-500";
        if (value <= 8) return "text-emerald-500";
        return "text-green-600";
    }

    function handleSubmit() {
        submitted = true;
        toast.success("Thank you! Your evaluation has been submitted.");
    }

    function next() {
        if (currentStep < totalSteps - 1) currentStep++;
    }

    function prev() {
        if (currentStep > 0) currentStep--;
    }
</script>

{#if submitted}
    <div class="min-h-[80vh] flex items-center justify-center p-6">
        <Card.Root class="max-w-lg w-full text-center shadow-lg">
            <Card.Header>
                <Card.Title class="text-2xl">Thank You!</Card.Title>
                <Card.Description class="text-base mt-2">
                    Your course evaluation has been submitted successfully. Your
                    feedback helps us improve the learning experience for
                    everyone.
                </Card.Description>
            </Card.Header>
            <Card.Footer class="justify-center">
                <Button variant="outline" href="/in/overview"
                    >Back to Overview</Button
                >
            </Card.Footer>
        </Card.Root>
    </div>
{:else}
    <div
        class="min-h-[80vh] flex flex-col items-center justify-start p-6 md:p-12"
    >
        <div class="max-w-2xl w-full space-y-8">
            <!-- Header -->
            <div class="space-y-2">
                <h1 class="text-3xl font-bold tracking-tight">
                    [course_name] ([section])
                </h1>
                <h2 class="text-xl font-bold tracking-tight">
                    Course Evaluation
                </h2>
            </div>

            <!-- Progress indicator -->
            <div class="space-y-2">
                <div class="flex justify-between text-sm text-muted-foreground">
                    <span
                        >Question {Math.min(currentStep + 1, questions.length)} of
                        {questions.length}</span
                    >
                    <span
                        >{Math.round((currentStep / (totalSteps - 1)) * 100)}%
                        complete</span
                    >
                </div>
                <Progress
                    value={(currentStep / (totalSteps - 1)) * 100}
                    class="h-2"
                />
            </div>

            <!-- Question cards (one at a time) -->
            {#each questions as question, i}
                {#if currentStep === i}
                    <div
                        class="animate-in fade-in-0 slide-in-from-right-4 duration-300"
                    >
                        <Card.Root class="shadow-md">
                            <Card.Header class="pb-4">
                                <div class="flex items-center gap-3">
                                    <span
                                        class="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                                    >
                                        {i + 1}
                                    </span>
                                    <div>
                                        <Card.Title class="text-lg"
                                            >{question.label}</Card.Title
                                        >
                                        <Card.Description class="mt-0.5">
                                            {question.description}
                                        </Card.Description>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Content class="space-y-6 pb-8 px-8">
                                <!-- Current value display -->
                                <div
                                    class="flex items-center justify-center gap-3"
                                >
                                    <span
                                        class="text-4xl font-bold tabular-nums transition-colors duration-200 {ratingColor(
                                            answers[question.id][0],
                                        )}"
                                    >
                                        {answers[question.id][0]}
                                    </span>
                                    <span class="text-lg text-muted-foreground"
                                        >/10</span
                                    >
                                    <span
                                        class="text-sm font-medium text-muted-foreground ml-1"
                                        >— {ratingLabel(
                                            answers[question.id][0],
                                        )}</span
                                    >
                                </div>

                                <!-- Slider -->
                                <div class="px-2">
                                    <Slider
                                        type="multiple"
                                        bind:value={answers[question.id]}
                                        min={1}
                                        max={10}
                                        step={1}
                                        class="w-full"
                                    />
                                </div>

                                <!-- Range labels -->
                                <div
                                    class="flex justify-between text-xs text-muted-foreground px-1"
                                >
                                    <span>{question.lowLabel}</span>
                                    <span>{question.highLabel}</span>
                                </div>

                                <!-- Quick-pick number buttons -->
                                <div class="flex justify-between gap-1">
                                    {#each Array.from({ length: 10 }, (_, k) => k + 1) as num}
                                        <button
                                            type="button"
                                            class="flex-1 h-9 rounded-md text-sm font-medium transition-all duration-150
												{answers[question.id][0] === num
                                                ? 'bg-primary text-primary-foreground shadow-sm scale-110'
                                                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
                                            onclick={() =>
                                                (answers[question.id] = [num])}
                                        >
                                            {num}
                                        </button>
                                    {/each}
                                </div>
                            </Card.Content>
                        </Card.Root>
                    </div>
                {/if}
            {/each}

            <!-- Review & Comment step -->
            {#if currentStep === questions.length}
                <div
                    class="animate-in fade-in-0 slide-in-from-right-4 duration-300 space-y-6"
                >
                    <Card.Root class="shadow-md">
                        <Card.Header>
                            <Card.Title class="text-lg"
                                >Review Your Ratings</Card.Title
                            >
                            <Card.Description>
                                Here's a summary of your responses. Go back to
                                change any answer.
                            </Card.Description>
                        </Card.Header>
                        <Card.Content class="space-y-4">
                            {#each questions as question, i}
                                <div
                                    class="flex items-center justify-between py-2 border-b last:border-0"
                                >
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm font-medium"
                                            >{question.label}</span
                                        >
                                    </div>
                                    <span
                                        class="text-lg font-bold tabular-nums {ratingColor(
                                            answers[question.id][0],
                                        )}"
                                    >
                                        {answers[question.id][0]}/10
                                    </span>
                                </div>
                            {/each}
                        </Card.Content>
                    </Card.Root>

                    <Card.Root class="shadow-md">
                        <Card.Header>
                            <Card.Title class="text-lg"
                                >Additional Comments</Card.Title
                            >
                            <Card.Description>
                                Anything else you'd like to share? (optional)
                            </Card.Description>
                        </Card.Header>
                        <Card.Content>
                            <Textarea
                                bind:value={comment}
                                placeholder="Share your thoughts, suggestions, or experiences…"
                                rows={4}
                                class="resize-none"
                            />
                        </Card.Content>
                    </Card.Root>
                </div>
            {/if}

            <!-- Navigation buttons -->
            <div class="flex justify-between pt-2">
                <Button
                    variant="outline"
                    onclick={prev}
                    disabled={currentStep === 0}
                >
                    ← Back
                </Button>

                {#if currentStep < totalSteps - 1}
                    <Button onclick={next}>Next →</Button>
                {:else}
                    <Button onclick={handleSubmit}>Submit Evaluation</Button>
                {/if}
            </div>
        </div>
    </div>
{/if}

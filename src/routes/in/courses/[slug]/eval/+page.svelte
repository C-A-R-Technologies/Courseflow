<script lang="ts">
    import type { PageData } from "./$types";
    import { Button } from "$lib/components/ui/button/index";
    import { Slider } from "$lib/components/ui/slider/index";
    import { Textarea } from "$lib/components/ui/textarea/index";
    import * as Card from "$lib/components/ui/card";
    import { Progress } from "$lib/components/ui/progress/index";
    import { toast } from "svelte-sonner";

    type Question = PageData["questions"][number];
    type Answers = Record<
        string,
        { response_option_id: string | null; response_text: string }
    >;

    const { data }: { data: PageData } = $props();
    const questions = $derived(data.questions);

    let answers = $state<Answers>({});

    let submitted = $state(false);
    let currentStep = $state(0);
    const totalSteps = $derived(questions.length + 1); // questions + review
    const currentQuestion = $derived(
        currentStep < questions.length ? questions[currentStep] : null,
    );
    const canProceed = $derived(
        currentQuestion
            ? !currentQuestion.required || isQuestionAnswered(currentQuestion)
            : true,
    );

    $effect(() => {
        if (Object.keys(answers).length > 0 || questions.length === 0) return;

        answers = Object.fromEntries(
            questions.map((question) => {
                const defaultOptionId =
                    question.response_kind === "agreement_scale"
                        ? (question.options.find(
                              (option) => option.numeric_score === 5,
                          )?.id ??
                          question.options[0]?.id ??
                          null)
                        : null;

                return [
                    question.id,
                    {
                        response_option_id: defaultOptionId,
                        response_text: "",
                    },
                ];
            }),
        ) as Answers;
    });

    function selectedOptionLabel(question: Question): string {
        const selectedOptionId = answers[question.id]?.response_option_id;
        if (!selectedOptionId) return "No response yet";

        const selectedOption = question.options.find(
            (option) => option.id === selectedOptionId,
        );
        return selectedOption?.label ?? "No response yet";
    }

    function isQuestionAnswered(question: Question): boolean {
        const answer = answers[question.id];
        if (!answer) return false;

        if (question.response_kind === "text") {
            return answer.response_text.trim().length > 0;
        }

        return answer.response_option_id !== null;
    }

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

    function selectedAgreementValue(question: Question): number {
        const optionId = answers[question.id]?.response_option_id;
        if (!optionId) return 5;

        const selected = question.options.find(
            (option) => option.id === optionId,
        );
        if (!selected || selected.numeric_score === null) return 5;
        return selected.numeric_score;
    }

    function setAgreementValue(question: Question, value: number) {
        const selectedOption = question.options.find(
            (option) => option.numeric_score === value,
        );
        if (!selectedOption) return;

        answers[question.id].response_option_id = selectedOption.id;
        answers = { ...answers };
    }

    function handleSubmit() {
        submitted = true;
        toast.success("Thank you! Your evaluation has been submitted.");
    }

    function next() {
        if (currentStep >= totalSteps - 1) return;

        if (!canProceed) {
            toast.error(
                "Please answer this required question before continuing.",
            );
            return;
        }

        currentStep++;
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
                    {data.section.course_name}
                    <span class="text-lg font-normal text-muted-foreground"
                        >({data.section.code})</span
                    >
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
                                            >{question.prompt}</Card.Title
                                        >
                                        <Card.Description class="mt-0.5">
                                            Question {i + 1}
                                        </Card.Description>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Content class="space-y-6 pb-8 px-8">
                                {#if question.response_kind === "text"}
                                    <Textarea
                                        bind:value={
                                            answers[question.id].response_text
                                        }
                                        placeholder="Share your feedback"
                                        rows={5}
                                        class="resize-none"
                                    />
                                {:else if question.response_kind === "agreement_scale"}
                                    <div
                                        class="flex items-center justify-center gap-3"
                                    >
                                        <span
                                            class="text-4xl font-bold tabular-nums transition-colors duration-200 {ratingColor(
                                                selectedAgreementValue(
                                                    question,
                                                ),
                                            )}"
                                        >
                                            {selectedAgreementValue(question)}
                                        </span>
                                        <span
                                            class="text-lg text-muted-foreground"
                                            >/10</span
                                        >
                                        <span
                                            class="text-sm font-medium text-muted-foreground ml-1"
                                            >- {ratingLabel(
                                                selectedAgreementValue(
                                                    question,
                                                ),
                                            )}</span
                                        >
                                    </div>

                                    <div class="px-2">
                                        <Slider
                                            type="multiple"
                                            value={[
                                                selectedAgreementValue(
                                                    question,
                                                ),
                                            ]}
                                            min={1}
                                            max={10}
                                            step={1}
                                            onValueChange={(value) =>
                                                setAgreementValue(
                                                    question,
                                                    value[0] ?? 5,
                                                )}
                                            class="w-full"
                                        />
                                    </div>

                                    <div class="flex justify-between gap-1">
                                        {#each Array.from({ length: 10 }, (_, k) => k + 1) as num}
                                            <button
                                                type="button"
                                                class="flex-1 h-9 rounded-md text-sm font-medium transition-all duration-150
                                                {selectedAgreementValue(
                                                    question,
                                                ) === num
                                                    ? 'bg-primary text-primary-foreground shadow-sm scale-110'
                                                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
                                                onclick={() =>
                                                    setAgreementValue(
                                                        question,
                                                        num,
                                                    )}
                                            >
                                                {num}
                                            </button>
                                        {/each}
                                    </div>
                                {:else}
                                    <div class="grid gap-2">
                                        {#each question.options as option}
                                            <button
                                                type="button"
                                                class="w-full rounded-md border px-4 py-2 text-left text-sm font-medium transition-colors
                                                {answers[question.id]
                                                    .response_option_id ===
                                                option.id
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border bg-background hover:bg-accent hover:text-accent-foreground'}"
                                                onclick={() => {
                                                    answers[
                                                        question.id
                                                    ].response_option_id =
                                                        option.id;
                                                    answers = { ...answers };
                                                }}
                                            >
                                                {option.label}
                                            </button>
                                        {/each}
                                    </div>
                                {/if}
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
                            {#each questions as question}
                                <div
                                    class="flex items-center justify-between py-2 border-b last:border-0"
                                >
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm font-medium"
                                            >{question.prompt}</span
                                        >
                                    </div>
                                    {#if question.response_kind === "text"}
                                        <span
                                            class="text-sm text-muted-foreground text-right max-w-xs truncate"
                                        >
                                            {answers[question.id]
                                                .response_text ||
                                                "No response yet"}
                                        </span>
                                    {:else}
                                        <span
                                            class="text-sm font-medium text-right"
                                        >
                                            {selectedOptionLabel(question)}
                                        </span>
                                    {/if}
                                </div>
                            {/each}
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
                    <Button onclick={next} disabled={!canProceed}>Next →</Button
                    >
                {:else}
                    <Button onclick={handleSubmit}>Submit Evaluation</Button>
                {/if}
            </div>
        </div>
    </div>
{/if}

<script lang="ts">
    import { Button } from "$lib/components/ui/button/index";
    import * as Card from "$lib/components/ui/card/index";
    import { Separator } from "$lib/components/ui/separator/index";
    import TextFadeIn from "$lib/components/text-fade-in.svelte";
</script>

<section
    class="flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center"
>
    <TextFadeIn
        text="About Courseflow"
        tag="h1"
        class="text-5xl font-bold tracking-tight md:text-6xl"
    />
    <p class="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. A next-generation
        platform transforming how students and institutions approach course
        evaluation.
    </p>
    <div class="mt-8 flex gap-4">
        <Button href="/login" variant="default" size="lg">Get Started</Button>
        <Button href="#features" variant="outline" size="lg"
            >Explore Features</Button
        >
    </div>
</section>

<Separator class="mx-auto max-w-4xl" />

<section class="mx-auto max-w-4xl px-6 py-20">
    <h2 class="text-3xl font-bold tracking-tight text-center">Our Mission</h2>
    <p
        class="mt-4 text-center text-muted-foreground max-w-2xl mx-auto leading-relaxed"
    >
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad
        minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
        ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
        voluptate velit esse cillum dolore eu fugiat nulla pariatur.
    </p>
</section>

<section id="features" class="mx-auto max-w-6xl px-6 pb-20">
    <h2 class="text-3xl font-bold tracking-tight text-center mb-10">
        Why Courseflow?
    </h2>
    <div class="grid gap-6 md:grid-cols-3">
        <Card.Root class="transition-shadow hover:shadow-md">
            <Card.Header>
                <div
                    class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-2xl mb-2"
                >
                    📊
                </div>
                <Card.Title class="text-lg">Real-Time Analytics</Card.Title>
                <Card.Description>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Praesent commodo cursus magna, vel scelerisque nisl
                    consectetur et.
                </Card.Description>
            </Card.Header>
        </Card.Root>

        <Card.Root class="transition-shadow hover:shadow-md">
            <Card.Header>
                <div
                    class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-2xl mb-2"
                >
                    🔒
                </div>
                <Card.Title class="text-lg">Anonymous Feedback</Card.Title>
                <Card.Description>
                    Sed ut perspiciatis unde omnis iste natus error sit
                    voluptatem accusantium doloremque laudantium, totam rem
                    aperiam.
                </Card.Description>
            </Card.Header>
        </Card.Root>

        <Card.Root class="transition-shadow hover:shadow-md">
            <Card.Header>
                <div
                    class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary text-2xl mb-2"
                >
                    🎯
                </div>
                <Card.Title class="text-lg">Actionable Insights</Card.Title>
                <Card.Description>
                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut
                    odit aut fugit, sed quia consequuntur magni dolores eos qui
                    ratione.
                </Card.Description>
            </Card.Header>
        </Card.Root>
    </div>
</section>

<section class="bg-muted/50 py-20">
    <div class="mx-auto max-w-4xl px-6">
        <h2 class="text-3xl font-bold tracking-tight text-center mb-12">
            How It Works
        </h2>
        <div class="grid gap-8 md:grid-cols-3">
            <div class="flex flex-col items-center text-center">
                <div
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4"
                >
                    1
                </div>
                <h3 class="text-lg font-semibold">Enroll & Connect</h3>
                <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Integer nec odio praesent libero sed cursus ante dapibus.
                </p>
            </div>
            <div class="flex flex-col items-center text-center">
                <div
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4"
                >
                    2
                </div>
                <h3 class="text-lg font-semibold">Evaluate Courses</h3>
                <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco
                    laboris nisi ut aliquip ex ea commodo consequat.
                </p>
            </div>
            <div class="flex flex-col items-center text-center">
                <div
                    class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold mb-4"
                >
                    3
                </div>
                <h3 class="text-lg font-semibold">Drive Improvement</h3>
                <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur.
                </p>
            </div>
        </div>
    </div>
</section>

<section class="bg-primary text-primary-foreground py-20">
    <div class="mx-auto max-w-3xl px-6 text-center">
        <h2 class="text-3xl font-bold tracking-tight">
            Ready to Transform Course Evaluation?
        </h2>
        <p class="mt-4 text-primary-foreground/80 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Join
            thousands of institutions already using Courseflow to gather
            meaningful student feedback.
        </p>
        <div class="mt-8 flex justify-center gap-4">
            <Button href="/login" variant="secondary" size="lg">
                Get Started Today
            </Button>
        </div>
    </div>
</section>
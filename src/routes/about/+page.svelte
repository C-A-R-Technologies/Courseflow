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
        CourseFlow is a redesigned course evalution system based on the existing 
        MyCourseEval system. Our goal is to improve the create a better user experience
        for students and faculty by improving the webpage's design and functionality.
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
        Our mission with CourseFlow is to improve the course evaluation process for students
        and faculty. We aim to provide a user-friendly platform that encourages honest feedback
        while keeping the anonymity of students. We also want to make it easier for faculty to
        access and analyze feedback that can drive meaningful improvements in course design.
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
                    Instantly visualize avaialble courses and evaluations through the student
                    dashboard. Faculty can also view course-wide metrics and areas for improvement
                    through the faculty dashboard.
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
                    Students can provide honest and constructive feedback in a secure,
                    anonymous environment, ensuring transparency while protecting their identity.
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
                    Transform feedback into meaningful recommendations for course 
                    improvements, helping faculty enhance the learning experience 
                    and drive positive change in course design and delivery.
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
                    Students log in using their academic accounts and are automatically
                    connected to their enrolled courses for seamless evaluation access.
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
                    Students complete structured evaluations taylored to each course,
                    providing valuable feedback on course content, professor performance,
                    and the overall learning experience.
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
                    Faculty can access student feedback through a dedicated dashboard 
                    to identify strengths and areas for improvement, enabling for 
                    improvements in future course designs.
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
            Join institutions adopting CourseFlow to modernize feedback collection,
            improve teaching effectiveness, and create better learning environments
            for students.
        </p>
        <div class="mt-8 flex justify-center gap-4">
            <Button href="/login" variant="secondary" size="lg">
                Get Started Today
            </Button>
        </div>
    </div>
</section>
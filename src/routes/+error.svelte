<script>
    import { page } from "$app/state";
    import { Button } from "$lib/components/ui/button/index";
</script>

<div class="flex flex-col justify-center items-center h-screen">
    <h1 class="text-9xl">Whoops!</h1>
    <h3 class="text-4xl p-4">Something went wrong.. You should try again.</h3>
    <h9 class="text-lg">If you're curious, that's a {page.status}.</h9>
    <Button href="/" variant="secondary" class="mt-6">Home</Button>
</div>

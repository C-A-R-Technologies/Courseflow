<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import logo from "$lib/assets/Courseflow Logo v2.svg";
</script>

<header
    class="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
>
    <div class="flex h-16 items-center justify-between px-6">
        <div class="flex items-center gap-2">
            <a href="/">
                <img src={logo} alt="Courseflow Logo" class="h-8 w-auto"/>
            </a>
        </div>

        <div class="flex gap-4">
            <Button href="/about" variant="ghost">About</Button>
            <Button href="/login" variant="ghost">Login</Button>
        </div>
    </div>
</header>

<style lang="postcss">
</style>

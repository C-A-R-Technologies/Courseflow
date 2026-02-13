<script lang="ts">
    interface Props {
        text: string;
        tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
        class?: string;
    }

    const { text, tag = "span", class: className = "" }: Props = $props();

    const characters = text.split("");
</script>

<svelte:element this={tag} class={className}>
    {#each characters as char, i}
        <span class="fade-in-char" style="--char-index: {i}">
            {char}
        </span>
    {/each}
</svelte:element>

<style>
    :global(:root) {
        --fade-in-duration: 1s;
        --fade-in-stagger: 0.075s;
    }

    :global(.fade-in-char) {
        animation: fadeInLight var(--fade-in-duration) ease-in-out forwards;
        animation-delay: calc(var(--char-index) * var(--fade-in-stagger));
        color: rgb(255, 255, 255);
    }

    :global(.dark .fade-in-char) {
        animation: fadeInDark var(--fade-in-duration) ease-in-out forwards;
        color: rgb(0, 0, 0);
    }

    @keyframes fadeInLight {
        from {
            color: rgb(255, 255, 255);
        }
        to {
            color: rgb(0, 0, 0);
        }
    }

    @keyframes fadeInDark {
        from {
            color: rgb(0, 0, 0);
        }
        to {
            color: rgb(255, 255, 255);
        }
    }
</style>

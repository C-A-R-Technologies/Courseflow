<script lang="ts">
  // UI components from shadcn-svelte
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
  } from "$lib/components/ui/card";

  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";

  // State for email and password
  let email = "";
  let password = "";

  // Simple login function
  // For now, it only prints the values.
  // Later, you can add real authentication here.
  function handleLogin() {
    console.log("Login:", email, password);
  }
</script>

<!-- Page layout: center the card on the screen -->
<div class="min-h-screen flex items-center justify-center bg-background">
  <!-- Main login card -->
  <Card class="w-full max-w-md">
    <CardHeader>
      <!-- Title and simple description -->
      <CardTitle class="text-2xl">Login</CardTitle>
      <CardDescription>
        Sign in to your Courseflow account.
      </CardDescription>
    </CardHeader>

    <CardContent class="space-y-4">
      <!-- Email input -->
      <div class="space-y-1">
        <Label for="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          bind:value={email}
        />
      </div>

      <!-- Password input -->
      <div class="space-y-1">
        <Label for="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          bind:value={password}
        />
      </div>
    </CardContent>

    <CardFooter class="flex flex-col gap-2">
      <!-- Login button -->
      <Button class="w-full" on:click={handleLogin}>
        Login
      </Button>

      <!-- Optional: A link for creating an account -->
      <!-- <a href="/register" class="text-sm text-center">Create an account</a> -->
    </CardFooter>
  </Card>
</div>

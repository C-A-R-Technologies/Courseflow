<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { toast } from "svelte-sonner";

  import { login } from "$lib/functions/login.remote";
  import { LoginRequest } from "$lib/models";

  let pending = $state(false);
</script>

<div class="min-h-screen flex items-center justify-center bg-background">
  <form
    {...login
      .preflight(LoginRequest)
      .enhance(async ({ form, data, submit }) => {
        pending = true;
        try {
          await submit();
          form.reset();
        } catch (error: any) {
          // ignore redirects
          if (error?.status >= 300 && error?.status < 400) {
            throw error;
          }
          console.error("login failed", error);
          toast.error("Login failed", { description: error?.body.message });
        } finally {
          pending = false;
        }
      })}
  >
    <!-- Main login card -->
    <Card class="w-full min-w-xs md:min-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl">Login</CardTitle>
        <CardDescription>Sign in to your Courseflow account.</CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="space-y-1">
          <Label for="email">Email</Label>
          <Input
            id="email"
            {...login.fields.email.as("email")}
            placeholder="you@snhu.edu"
          />
        </div>

        <div class="space-y-1">
          <Label for="password">Password</Label>
          <Input
            id="password"
            {...login.fields._password.as("password")}
            placeholder="••••••••"
          />
        </div>
      </CardContent>

      <CardFooter class="flex flex-col gap-2">
        <Button class="w-full" type="submit" disabled={pending}>
          {pending ? "Logging in..." : "Login"}
        </Button>
      </CardFooter>
    </Card>
  </form>
</div>

import { privateEnv } from "$lib/env/private";
import { error } from "@sveltejs/kit";
import postgres from "postgres";

export const db = postgres(privateEnv.DATABASE_URL, {
    //ssl: "require",
    connect_timeout: 60,
});

export const sql = async (...args: Parameters<typeof db>) => {
    try {
        return await db(...args);
    } catch (err: unknown) {
        const e = err as any;
        const isConnRefused =
            err instanceof AggregateError
                ? Array.isArray(err.errors) && err.errors.some((inner: any) => inner?.code === "ECONNREFUSED")
                : e?.code === "ECONNREFUSED" || String(e?.message).includes("ECONNREFUSED");

        if (isConnRefused) error(503, { message: "Backend unavailable" });
        throw err;
    }
};
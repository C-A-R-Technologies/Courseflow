import { privateEnv } from "$lib/env/private";
import { error } from "@sveltejs/kit";
import { Term } from "$lib/models";
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

export const getActiveTerm = async () => {
    const result = await sql`
        SELECT *
        FROM terms
        WHERE starts_at <= CURRENT_DATE
          AND ends_at >= CURRENT_DATE
        ORDER BY starts_at DESC
        LIMIT 1
    `;

    if (result.length === 0) return null;

    return Term.parse(result[0]);
}

export const getUpcomingTerm = async () => {
    const result = await sql`
        SELECT *
        FROM terms
        WHERE starts_at > CURRENT_DATE
        ORDER BY starts_at ASC
        LIMIT 1
    `;

    if (result.length === 0) return null;

    return Term.parse(result[0]);
}

export const getPreviousTerm = async () => {
    const result = await sql`
        SELECT *
        FROM terms
        WHERE ends_at < CURRENT_DATE
        ORDER BY ends_at DESC
        LIMIT 1
    `;

    if (result.length === 0) return null;

    return Term.parse(result[0]);
}

export const fetchTermAuto = async () => {
    const activeTerm = await getActiveTerm();
    if (activeTerm) return activeTerm;

    const upcomingTerm = await getUpcomingTerm();
    if (upcomingTerm) return upcomingTerm;

    const previousTerm = await getPreviousTerm();
    if (previousTerm) return previousTerm;

    return null;
}
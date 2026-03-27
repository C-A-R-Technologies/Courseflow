import { env } from "$env/dynamic/public";
import z from "zod";

export const publicEnv = z
    .object({
        /** Origin used in outbound emails. */
        PUBLIC_BASE_URL: z.url().default("http://localhost:5173"),

        /** Path to the initial evaluation JSON file. */
        INIT_EVALUATION_JSON: z.string().optional().default("base_evaluation.json"),
    })
    .transform(env => {
        const { PUBLIC_BASE_URL, INIT_EVALUATION_JSON, ...rest } = env;

        return {
            base_url: PUBLIC_BASE_URL,
            init_evaluation_json: INIT_EVALUATION_JSON,
            ...rest,
        };
    })
    .parse(env);

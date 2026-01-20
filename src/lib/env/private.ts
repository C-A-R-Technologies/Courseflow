import { env } from "$env/dynamic/private";
import z from "zod";

export const privateEnv = z
    .object({
        /** Postgres connection string. */
        DATABASE_URL: z.url(),
        /** JWT access token secrets. */
        JWT_ACCESS_SECRET: z.string(),
        /** Runtime environment. Currently only changes whether secure cookies are used. */
        NODE_ENV: z.enum(["development", "production", "test"]),
        /** If the specified user does not exist on startup, it will be created with the specified email and `INIT_PASSWORD`. */
        INIT_EMAIL: z.string().optional(),
        /** If the specified user does not exist on startup, it will be created with the specified password and `NIT_USERNAME`. */
        INIT_PASSWORD: z.string().optional(),
    })
    .transform(env => {
        const {
            JWT_ACCESS_SECRET,
            INIT_EMAIL,
            INIT_PASSWORD,
            ...rest
        } = env;

        return {
            ...rest,
            ...{
                jwtSecrets: {
                    access: JWT_ACCESS_SECRET,
                },
            },
        };
    })
    .parse(env);

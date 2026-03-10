import { env } from "$env/dynamic/private";
import z from "zod";

export const privateEnv = z
    .object({
        /** Postgres connection string. */
        DATABASE_URL: z.url(),
        /** JWT access token secrets. */
        JWT_ACCESS_SECRET: z.string(),
        /** JWT reset password token secrets. */
        JWT_RESET_PASSWORD_SECRET: z.string(),
        /** Runtime environment. Currently only changes whether secure cookies are used. */
        NODE_ENV: z.enum(["development", "production", "test"]),
        /** If the specified user does not exist on startup, it will be created with the specified email and `INIT_PASSWORD`. */
        INIT_EMAIL: z.string().optional(),
        /** If the specified user does not exist on startup, it will be created with the specified password and `INIT_USERNAME`. */
        INIT_PASSWORD: z.string().optional(),
        /** Email address outgoing emails will be sent from. */
        SMTP_FROM_ADDRESS: z.email().optional(),
        /** SMTP host. */
        SMTP_HOST: z.string().optional(),
        /** SMTP password. */
        SMTP_PASSWORD: z.string().optional(),
        /** SMTP port. */
        SMTP_PORT: z.coerce.number().optional().default(587),
        /** SMTP username. */
        SMTP_USERNAME: z.string().optional(),
    })
    .transform(env => {
        const {
            JWT_ACCESS_SECRET,
            JWT_RESET_PASSWORD_SECRET,
            INIT_EMAIL,
            INIT_PASSWORD,
            SMTP_FROM_ADDRESS,
            SMTP_HOST,
            SMTP_PASSWORD,
            SMTP_PORT,
            SMTP_USERNAME,
            ...rest
        } = env;

        return {
            ...rest,
            ...{
                jwtSecrets: {
                    access: JWT_ACCESS_SECRET,
                    resetPassword: JWT_RESET_PASSWORD_SECRET,
                },
                init: {
                    email: INIT_EMAIL,
                    password: INIT_PASSWORD,
                },
                smtp: {
                    fromAddress: SMTP_FROM_ADDRESS,
                    host: SMTP_HOST,
                    password: SMTP_PASSWORD,
                    port: SMTP_PORT,
                    username: SMTP_USERNAME,
                }
            },
        };
    })
    .parse(env);

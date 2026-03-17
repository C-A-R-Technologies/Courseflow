import { z } from "zod";

// Postgres drivers can return timestamptz columns as Date objects.
// Normalize both Date and ISO string inputs to ISO datetime strings.
const IsoDateTime = z.preprocess(
    value => value instanceof Date ? value.toISOString() : value,
    z.iso.datetime()
);

export const Password = z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(70, "Password must be at most 70 characters.")
    .refine(val => /[A-Z]/.test(val), {
        error: "Password must contain at least one uppercase letter.",
    })
    .refine(val => /[0-9]/.test(val), {
        error: "Password must contain at least one number.",
    })
    .refine(val => /[^A-Za-z0-9].*[^A-Za-z0-9]/.test(val), {
        error: "Password must contain at least two special characters.",
    });
export type Password = z.infer<typeof Password>;

export const User = z.object({
    id: z.uuid(),
    email: z.email().max(100),
    firstname: z.string().max(100),
    lastname: z.string().max(100),
    role: z.enum(["student", "instructor", "dean", "admin"]),
    password_hash: z.string().nullable(),
    password_reset_last_requested_at: IsoDateTime.nullable(),
    last_login: IsoDateTime.nullable(),
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type User = z.infer<typeof User>;

export const Term = z.object({
    id: z.uuid(),
    code: z.string().max(3),
    starts_at: IsoDateTime,
    ends_at: IsoDateTime,
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type Term = z.infer<typeof Term>;

export const Course = z.object({
    id: z.uuid(),
    course_code: z.string().max(20),
    course_name: z.string().max(100),
    description: z.string().max(500).nullable(),
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type Course = z.infer<typeof Course>;

export const Section = z.object({
    id: z.uuid(),
    code: z.string().length(5),
    instructor_id: z.uuid().nullable(),
    course_id: z.uuid(),
    term_id: z.uuid(),
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type Section = z.infer<typeof Section>;

// below are request and response schemas
export const LoginRequest = z.object({
    email: z.email().max(100),
    _password: Password,
});
export type LoginRequest = z.infer<typeof LoginRequest>;
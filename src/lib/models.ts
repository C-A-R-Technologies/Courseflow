import { z } from "zod";

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
    role: z.enum(["student", "faculty", "admin"]),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime()
});
export type User = z.infer<typeof User>;

export const Term = z.object({
    id: z.uuid(),
    code: z.string().max(3),
    starts_at: z.iso.datetime(),
    ends_at: z.iso.datetime(),
});
export type Term = z.infer<typeof Term>;

export const Course = z.object({
    id: z.uuid(),
    course_code: z.string().max(20),
    course_name: z.string().max(100),
    description: z.string().max(500).nullable(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime()
});
export type Course = z.infer<typeof Course>;

export const Section = z.object({
    id: z.uuid(),
    code: z.string().length(5),
    instructor_id: z.uuid().nullable(),
    course_id: z.uuid(),
    term_id: z.uuid(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime()
});
export type Section = z.infer<typeof Section>;
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

export const Enrollment = z.object({
    id: z.uuid(),
    user_id: z.uuid(),
    section_id: z.uuid(),
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type Enrollment = z.infer<typeof Enrollment>;

export const Term = z.object({
    id: z.uuid(),
    code: z.string().max(3),
    starts_at: IsoDateTime,
    ends_at: IsoDateTime,
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type Term = z.infer<typeof Term>;

export const School = z.object({
    id: z.uuid(),
    name: z.string().max(100),
    abbreviation: z.string().max(10),
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type School = z.infer<typeof School>;

export const SchoolAdmin = z.object({
    id: z.uuid(),
    user_id: z.uuid(),
    school_id: z.uuid(),
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type SchoolAdmin = z.infer<typeof SchoolAdmin>;

export const Course = z.object({
    id: z.uuid(),
    course_code: z.string().max(20),
    course_name: z.string().max(100),
    description: z.string().max(500).nullable(),
    school_id: z.uuid(),
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

export const EvaluationCategory = z.object({
    id: z.uuid(),
    school_id: z.uuid().nullable(),
    sort_index: z.number().int().min(0).max(32767),
    name: z.string().max(50),
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type EvaluationCategory = z.infer<typeof EvaluationCategory>;

export const EvaluationQuestion = z.object({
    id: z.uuid(),
    school_id: z.uuid().nullable(),
    category_id: z.uuid(),
    response_kind: z.enum(["agreement_scale", "yes_no", "text"]),
    prompt: z.string().max(500),
    required: z.boolean(),
    active: z.boolean(),
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type EvaluationQuestion = z.infer<typeof EvaluationQuestion>;

export const EvaluationQuestionOption = z.object({
    id: z.uuid(),
    question_id: z.uuid(),
    label: z.string().max(50),
    numeric_score: z.number().int().min(-32768).max(32767).nullable(),
    sort_index: z.number().int().min(0).max(32767),
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type EvaluationQuestionOption = z.infer<typeof EvaluationQuestionOption>;

export const EvaluationForm = z.object({
    id: z.uuid(),
    section_id: z.uuid(),
    opens_at: IsoDateTime,
    closes_at: IsoDateTime,
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type EvaluationForm = z.infer<typeof EvaluationForm>;

export const EvaluationResponse = z.object({
    id: z.uuid(),
    form_id: z.uuid(),
    question_id: z.uuid(),
    user_id: z.uuid(),
    response_text: z.string().nullable(),
    response_option_id: z.uuid().nullable(),
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type EvaluationResponse = z.infer<typeof EvaluationResponse>;

export const EvaluationCompletion = z.object({
    id: z.uuid(),
    form_id: z.uuid(),
    user_id: z.uuid(),
    submitted_at: IsoDateTime,
    created_at: IsoDateTime,
    updated_at: IsoDateTime
});
export type EvaluationCompletion = z.infer<typeof EvaluationCompletion>;

/*
below are request and response schemas
*/
export const LoginRequest = z.object({
    email: z.email().max(100),
    _password: z.string().max(70), // One would think to use the password schema here, but if the password schema changed, it would lock out users with old but now invalid passwords
});
export type LoginRequest = z.infer<typeof LoginRequest>;

export const StudentCourseOverview = z.object({
    section_id: z.uuid(),
    section_code: z.string().length(5),
    course_id: z.uuid(),
    course_name: z.string().max(100),
    instructor_name: z.string().max(200),
    evaluation_form_id: z.uuid(),
    evaluation_form_opens_at: IsoDateTime,
    evaluation_form_closes_at: IsoDateTime,
    evaluation_completed: z.boolean(),
    evaluation_completed_at: IsoDateTime.nullable(),
});
export type StudentCourseOverview = z.infer<typeof StudentCourseOverview>;

export const FacultyCourseOverview = z.object({
    section_id: z.uuid(),
    section_code: z.string().length(5),
    course_id: z.uuid(),
    course_name: z.string().max(100),
    instructor_name: z.string().max(200),
    evaluation_form_id: z.uuid(),
    evaluation_form_opens_at: IsoDateTime,
    evaluation_form_closes_at: IsoDateTime,
    evaluations_completed: z.number().int().min(0),
});
export type FacultyCourseOverview = z.infer<typeof FacultyCourseOverview>;
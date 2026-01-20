import { Term, User } from "$lib/models";
import { sql } from "./postgres";

export async function getActiveTerm(getNextIfNone = false): Promise<Term | undefined> {
    return undefined;
}

export async function getNextTerm(): Promise<Term | undefined> {
    return undefined;
}

export async function getLastTerm(): Promise<Term | undefined> {
    // Get the most recent term that has ended
    return undefined;
}

export async function createUser(
    email: string,
    name: string,
    role: "student" | "faculty" | "admin",
    password_hash?: string,
): Promise<User | undefined> {
    return undefined;
}

export async function updateUserPassword(email: string, password_hash: string) {
    await sql`
        UPDATE users 
        SET password_hash = ${password_hash}
        WHERE email = ${email}
    `;
}

export async function userExists(student_id: string, email: string): Promise<boolean> {
    const result = await sql`
        SELECT student_id
        FROM users
        WHERE student_id = ${student_id}
        OR email = ${email}
        LIMIT 1
	`;

    return result.count === 1;
}
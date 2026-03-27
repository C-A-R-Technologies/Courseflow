import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { User } from '$lib/models';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async ( { locals } ) => {
    if (locals.user.role === "admin") {
        console.log("Loading admin data for user:", locals.user.email);
        // return admin data
    }
    if (locals.user.role === "dean") {
        console.log("Loading dean data for user:", locals.user.email);
        // return dean data
    }
    if (locals.user.role === "instructor") {
        console.log("Loading instructor data for user:", locals.user.email);
        // return instructor data
    }
    if (locals.user.role === "student") {
        console.log("Loading student data for user:", locals.user.email);
        // return student data
    }

    return { user: locals.user };
};
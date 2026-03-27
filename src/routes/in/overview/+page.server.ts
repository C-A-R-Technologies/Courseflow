import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { User } from '$lib/models';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async ( { locals } ) => {
    if (locals.user.role === "instructor") {
        // return instructor data
    }
    else if (locals.user.role === "student") {
        // return student data
    }

    return { user: locals.user };
};
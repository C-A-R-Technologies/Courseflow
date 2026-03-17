import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { User } from '$lib/models';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async ( { locals } ) => {
    return { user: locals.user };
};
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { User } from '$lib/models';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async () => {
    // return dummy data for now, until authentication is implemented
    const tempUser: User = {
        id: randomUUID(),
        email: 'avery.bertrand@snhu.edu',
        firstname: 'Avery',
        lastname: 'Bertrand',
        role: 'student',
        created_at: new Date().toString(),
        updated_at: new Date().toString()
    };
    return { user: tempUser };
};
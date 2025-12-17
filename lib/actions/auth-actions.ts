'use server';

import { auth } from '@/lib/auth';
import {headers} from "next/headers";
import {revalidatePath} from "next/cache";
import { prisma } from '@/lib/utils/prisma';

// =====================================================================================================================
// SIGN IN & SIGN UP
// =====================================================================================================================\
export const signUp = async (email: string, password: string, name: string, username: string) => {
    try {
        const result = await auth.api.signUpEmail({
            body: {
                email,
                password,
                name,
                username,
                callbackURL: "/"
            },
            headers: await headers()
        });

        if (!result?.user) {
            return { ok: false, message: 'Account Not Created' };
        }

        return { ok: true, redirect: '/' };
    } catch (error) {
        console.error('Sign up error:', error);
        return {
            ok: false,
            message: error instanceof Error ? error.message : 'Failed to create account'
        };
    }
};

export const signInEmail = async (email: string, password: string) => {
    try {
        const result = await auth.api.signInEmail({
            body: {
                email,
                password,
                callbackURL: "/"
            },
            headers: await headers()
        });

        if (!result?.user) {
            console.error('Sign in failed: No user returned');
            return { ok: false, message: 'Invalid email or password' };
        }

        return { ok: true, redirect: '/' };
    } catch (error) {
        console.error('Sign in error:', error);
        return {
            ok: false,
            message: error instanceof Error ? error.message : 'Authentication failed'
        };
    }
};

export const signInUsername = async (username: string, password: string) => {
    try {
        const result = await auth.api.signInUsername({
            body: {
                username,
                password,
                callbackURL: "/"
            },
            headers: await headers()
        });

        if (!result?.user) {
            return { ok: false, message: 'Invalid username or password' };
        }

        return { ok: true, redirect: '/' };
    } catch (error) {
        console.error('Sign in error:', error);
        return {
            ok: false,
            message: error instanceof Error ? error.message : 'Authentication failed'
        };
    }
};

export const signOut = async () => {
    const result = await auth.api.signOut({
        headers: await headers(),
    })

    return result;
};


// =====================================================================================================================
// USER-LEVEL ACCOUNT MANAGEMENT
// =====================================================================================================================
export async function updateUsername(newUsername: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error('Unauthorized');
    }

    // Check if username is already taken
    const existingUser = await prisma.user.findUnique({
        where: { username: newUsername }
    });

    if (existingUser && existingUser.id !== session.user.id) {
        return { ok: false, message: 'Username is already taken' };
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { username: newUsername }
    });

    revalidatePath('/');
    return { ok: true, message: 'Username updated successfully' };
}

export async function changeEmail(newEmail: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error('Unauthorized');
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
        where: { email: newEmail }
    });

    if (existingUser && existingUser.id !== session.user.id) {
        return { ok: false, message: 'Email is already in use' };
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            email: newEmail,
            emailVerified: false // Reset verification status
        }
    });

    revalidatePath('/');
    return { ok: true, message: 'Email updated successfully. Please verify your new email.' };
}

export async function changePassword(currentPassword: string, newPassword: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error('Unauthorized');
    }

    // Verify current password
    const account = await prisma.account.findFirst({
        where: {
            userId: session.user.id,
            providerId: 'credential'
        }
    });

    if (!account || !account.password) {
        return { ok: false, message: 'No password set for this account' };
    }

    // Use better-auth context to verify and hash passwords
    const ctx = await auth.$context;
    const isValidPassword = await ctx.password.verify({
        hash: account.password,
        password: currentPassword
    });

    if (!isValidPassword) {
        return { ok: false, message: 'Current password is incorrect' };
    }

    // Hash new password
    const hashedPassword = await ctx.password.hash(newPassword);

    // Update password in account table
    await prisma.account.update({
        where: { id: account.id },
        data: { password: hashedPassword }
    });

    revalidatePath('/');
    return { ok: true, message: 'Password changed successfully' };
}

export async function updateName(newName: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        throw new Error('Unauthorized');
    }

    await prisma.user.update({
        where: {id: session.user.id},
        data: {name: newName}
    });

    revalidatePath('/');
    return {ok: true, message: 'Display name updated successfully'};
}





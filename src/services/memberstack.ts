import { Memberstack } from '@memberstack/react';

// Initialize Memberstack
export const memberstack = new Memberstack({
  publicKey: process.env.REACT_APP_MEMBERSTACK_PUBLIC_KEY || '',
});

// Auth state management
export const getAuthState = async () => {
  try {
    const member = await memberstack.getCurrentMember();
    return {
      isAuthenticated: !!member,
      member,
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      member: null,
    };
  }
};

// Auth actions
export const signUp = async (email: string, password: string) => {
  try {
    const member = await memberstack.signUp({
      email,
      password,
    });
    return { success: true, member };
  } catch (error) {
    return { success: false, error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const member = await memberstack.signIn({
      email,
      password,
    });
    return { success: true, member };
  } catch (error) {
    return { success: false, error };
  }
};

export const signOut = async () => {
  try {
    await memberstack.signOut();
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}; 
// Memberstack logic should be handled via the useMemberstack hook in React components.
// Example usage in a component:
// import { useMemberstack } from '@memberstack/react';
// const memberstack = useMemberstack();

// All authentication and member actions should be performed using the hook above directly in your components.

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
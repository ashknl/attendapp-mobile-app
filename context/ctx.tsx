import { createContext, use, type PropsWithChildren } from 'react';

import { useStorageState } from './useStorageState';

const AuthContext = createContext<{
    signIn: (email: string, password: string, role: string) => void;
    signOut: () => void;
    session?: string | null;
    isLoading: boolean;
}>({
    signIn: (email: string, password: string, role: string) => null,
    signOut: () => null,
    session: null,
    isLoading: false,
});

const API_URL = "https://nonnomadic-unbleached-otilia.ngrok-free.app"

// Use this hook to access the user info.
export function useSession() {
    const value = use(AuthContext);
    if (!value) {
        throw new Error('useSession must be wrapped in a <SessionProvider />');
    }

    return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
    const [[isLoading, session], setSession] = useStorageState('session');

    return (
        <AuthContext
            value={{
                signIn: async (email, password, role) => {
                    // Perform sign-in logic here
                    const endpoint = `${API_URL}/api/auth/login`;

                    // 1. Create the request body object with the required parameters.
                    const requestBody = {
                        email,
                        password,
                        role
                    };

                    try {

                        const response = await fetch(endpoint, {
                            method: 'POST',
                            headers: {

                                'Content-Type': 'application/json',
                            },

                            body: JSON.stringify(requestBody),
                        });


                        if (!response.ok) {
                            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                            throw new Error(`Sign-in failed with status ${response.status}: ${errorData.message || response.statusText}`);
                        }

                        // 4. The response is a plain text token, so we use response.text().
                        const { token } = await response.json();
                        console.log('Sign-in successful!');

                        let obj = { "token": token, "role": role }
                        setSession(JSON.stringify(obj));

                    } catch (error) {
                        // 5. Catch any network errors or errors thrown from the response check.
                        console.error('An error occurred during sign-in:', error);
                        // Re-throw the error so the calling code can handle it if needed.
                        throw error;
                    }
                },
                signOut: () => {
                    setSession(null);
                },
                session,
                isLoading,
            }}>
            {children}
        </AuthContext>
    );
}

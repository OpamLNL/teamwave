import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { auth, googleProvider, hasFirebaseConfig } from '../firebase';
import { onAuthStateChanged, onIdTokenChanged, signInWithPopup, getRedirectResult, signOut } from 'firebase/auth';
import { endpoints } from '../api/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const syncInFlight = useRef(null);

    const syncDbUser = async (firebaseUser, token) => {
        if (syncInFlight.current) {
            return syncInFlight.current;
        }

        const syncPromise = (async () => {
            const authRes = await fetch(endpoints.auth.firebase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: firebaseUser.displayName || null,
                    avatar_url: firebaseUser.photoURL || null,
                    email: firebaseUser.email || null,
                }),
            });

            if (!authRes.ok) {
                const errBody = await authRes.json().catch(() => ({}));
                throw new Error(
                    errBody.error || 'Не вдалося синхронізувати з сервером. Перевір URL API (VITE_* на Vercel) і доступність бекенду.'
                );
            }

            const authData = await authRes.json();

            const profileRes = await fetch(endpoints.users.byFirebase(firebaseUser.uid));
            const profile = profileRes.ok ? await profileRes.json() : {};

            const dbUser = {
                id: authData.id ?? profile.id,
                firebase_uid: firebaseUser.uid,
                firebaseUid: authData.firebaseUid || firebaseUser.uid,
                email: profile.email || authData.email || firebaseUser.email,
                name: profile.name || authData.name || firebaseUser.displayName || 'Новий користувач',
                avatar_url: profile.avatar_url || authData.avatar_url || firebaseUser.photoURL,
                role: (profile.role || authData.role || 'participant').toLowerCase(),
                show_mature_content: Boolean(profile.show_mature_content ?? authData.show_mature_content),
            };

            if (!dbUser.id) {
                throw new Error('Не вдалося визначити id користувача в базі');
            }

            localStorage.setItem('role', dbUser.role);
            localStorage.setItem('user', JSON.stringify(dbUser));
            setUser(dbUser);
            setRole(dbUser.role);
            return dbUser;
        })();

        syncInFlight.current = syncPromise;

        try {
            return await syncPromise;
        } finally {
            syncInFlight.current = null;
        }
    };

    const login = async () => {
        if (!auth || !googleProvider) {
            throw new Error('Firebase не налаштовано. Додай ключі в teamwave/.env');
        }
        const result = await signInWithPopup(auth, googleProvider);
        const token = await result.user.getIdToken();
        localStorage.setItem('token', token);
        await syncDbUser(result.user, token);
    };

    const logout = async () => {
        if (auth) await signOut(auth);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        setUser(null);
        setRole(null);
    };

    const updateProfile = useCallback((partial) => {
        setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...partial };
            localStorage.setItem('user', JSON.stringify(next));
            return next;
        });
    }, []);

    useEffect(() => {
        if (!hasFirebaseConfig || !auth) {
            setLoading(false);
            return undefined;
        }

        let authUnsubscribe;
        let tokenUnsubscribe;
        let disposed = false;

        const initAuth = async () => {
            try {
                await getRedirectResult(auth);
            } catch (error) {
                console.error('Помилка входу через Google:', error);
            }

            if (disposed) return;

            tokenUnsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    const token = await firebaseUser.getIdToken(false);
                    localStorage.setItem('token', token);
                } else {
                    localStorage.removeItem('token');
                }
            });

            authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (!firebaseUser) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    localStorage.removeItem('user');
                    setUser(null);
                    setRole(null);
                    setLoading(false);
                    return;
                }

                const savedUser = localStorage.getItem('user');
                const savedRole = localStorage.getItem('role');

                try {
                    const token = await firebaseUser.getIdToken(true);
                    localStorage.setItem('token', token);
                    await syncDbUser(firebaseUser, token);
                } catch (error) {
                    console.error('Помилка синхронізації користувача:', error);
                    if (savedUser && savedRole) {
                        setUser(JSON.parse(savedUser));
                        setRole(savedRole.toLowerCase());
                    } else {
                        localStorage.removeItem('role');
                        localStorage.removeItem('user');
                        setUser(null);
                        setRole(null);
                    }
                } finally {
                    setLoading(false);
                }
            });
        };

        initAuth();

        return () => {
            disposed = true;
            authUnsubscribe?.();
            tokenUnsubscribe?.();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, login, logout, loading, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

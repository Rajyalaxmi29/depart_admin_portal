import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AppUser } from '@/types/app';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inFlightProfileFetches = useRef<Map<string, Promise<AppUser | null>>>(new Map());
  const loadUserProfile = useCallback(async (userId: string, fallbackEmail?: string | null): Promise<AppUser | null> => {
    const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const rootTimer = `[Profile Fetch #${runId}] ${userId}`;
    try {
      console.time(rootTimer);
      
      const step1Timer = `${rootTimer} [1] Fetch profile`;
      console.time(step1Timer);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, phone, avatar_url, faculty_id, department_id')
        .eq('id', userId)
        .maybeSingle();
      console.timeEnd(step1Timer);

      if (error) {
        console.error('Failed to load profile', error);
        return null;
      }

      let safeProfile = profile;
      if (!safeProfile) {
        const step2Timer = `${rootTimer} [2] Create profile`;
        console.time(step2Timer);
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            email: fallbackEmail ?? '',
            name: (fallbackEmail ?? 'User').split('@')[0],
            role: 'department_admin',
          }, { onConflict: 'id' });
        console.timeEnd(step2Timer);

        if (upsertError) {
          console.error('Failed to create profile', upsertError);
          return null;
        }

        const step2bTimer = `${rootTimer} [2b] Reload profile`;
        console.time(step2bTimer);
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .select('id, name, email, role, phone, avatar_url, faculty_id, department_id')
          .eq('id', userId)
          .single();
        console.timeEnd(step2bTimer);

        if (insertError) {
          console.error('Failed to create profile', insertError);
          return null;
        }
        safeProfile = inserted;
      }

      let department: AppUser['department'] = {
        id: safeProfile.department_id ?? undefined,
        name: 'Department',
        facultyId: safeProfile.faculty_id ?? undefined,
        institution: 'Institution',
      };

      if (safeProfile.department_id) {
        try {
          const step3Timer = `${rootTimer} [3] Fetch department`;
          console.time(step3Timer);
          const { data: dept } = await supabase
            .from('departments')
            .select('id, name, head, innovation_lab, location, institution_id')
            .eq('id', safeProfile.department_id)
            .maybeSingle();
          console.timeEnd(step3Timer);

          let institutionName = 'Institution';
          if (dept?.institution_id) {
            const step4Timer = `${rootTimer} [4] Fetch institution`;
            console.time(step4Timer);
            const { data: inst } = await supabase
              .from('institutions')
              .select('name')
              .eq('id', dept.institution_id)
              .maybeSingle();
            console.timeEnd(step4Timer);
            institutionName = inst?.name ?? institutionName;
          }

          if (dept) {
            department = {
              id: dept.id,
              name: dept.name,
              facultyId: safeProfile.faculty_id ?? undefined,
              institution: institutionName,
              head: dept.head ?? undefined,
              innovationLab: dept.innovation_lab ?? undefined,
              location: dept.location ?? undefined,
            };
          }
        } catch (deptError) {
          console.error('Failed to load department info', deptError);
          // Continue with basic department info instead of failing
        }
      }

      return {
        id: safeProfile.id,
        name: safeProfile.name ?? 'User',
        email: safeProfile.email ?? fallbackEmail ?? '',
        role: safeProfile.role ?? 'department_admin',
        department,
        phone: safeProfile.phone ?? undefined,
        avatar: safeProfile.avatar_url ?? undefined,
      };
    } catch (error) {
      console.error('Profile fetch failed:', error);
      // Return a minimal user object so auth isn't completely blocked
      return {
        id: userId,
        name: (fallbackEmail ?? 'User').split('@')[0],
        email: fallbackEmail ?? '',
        role: 'department_admin',
        department: {
          name: 'Department',
          institution: 'Institution',
        },
      };
    } finally {
      console.timeEnd(rootTimer);
    }
  }, []);

  const fetchUserProfile = useCallback(async (userId: string, fallbackEmail?: string | null): Promise<AppUser | null> => {
    const existingRequest = inFlightProfileFetches.current.get(userId);
    if (existingRequest) {
      return existingRequest;
    }

    const request = loadUserProfile(userId, fallbackEmail).finally(() => {
      inFlightProfileFetches.current.delete(userId);
    });

    inFlightProfileFetches.current.set(userId, request);
    return request;
  }, [loadUserProfile]);

  useEffect(() => {
    let mounted = true;

    const applySession = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      const authUser = session?.user;
      if (!authUser) {
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const profile = await fetchUserProfile(authUser.id, authUser.email);
      if (mounted) {
        setUser(profile);
        setIsLoading(false);
      }
    };

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      await applySession(data.session);
    };

    void bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      // Avoid awaiting Supabase calls directly in auth callbacks; defer async work.
      setTimeout(() => {
        void applySession(session);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.time('[Auth] signInWithPassword');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      console.timeEnd('[Auth] signInWithPassword');
      
      if (error) {
        console.error('Login failed', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    void supabase.auth.signOut();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;
      if (!authUser) return;
      const profile = await fetchUserProfile(authUser.id, authUser.email);
      setUser(profile);
    } catch (err) {
      console.error('refreshUser failed', err);
    }
  }, [fetchUserProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

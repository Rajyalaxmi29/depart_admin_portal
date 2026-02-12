import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AppUser } from '@/types/app';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string, fallbackEmail?: string | null): Promise<AppUser | null> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, email, role, phone, avatar_url, faculty_id, department_id')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile', error);
      return null;
    }

    let safeProfile = profile;
    if (!safeProfile) {
      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: fallbackEmail ?? '',
          name: (fallbackEmail ?? 'User').split('@')[0],
          role: 'department_admin',
        })
        .select('id, name, email, role, phone, avatar_url, faculty_id, department_id')
        .single();

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
      const { data: dept } = await supabase
        .from('departments')
        .select('id, name, head, innovation_lab, location, institution_id')
        .eq('id', safeProfile.department_id)
        .maybeSingle();

      let institutionName = 'Institution';
      if (dept?.institution_id) {
        const { data: inst } = await supabase
          .from('institutions')
          .select('name')
          .eq('id', dept.institution_id)
          .maybeSingle();
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
  }, []);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      const authUser = data.session?.user;

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

    bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user;
      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const profile = await fetchUserProfile(authUser.id, authUser.email);
      setUser(profile);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login failed', error.message);
      return false;
    }
    return true;
  }, []);

  const logout = useCallback(() => {
    void supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
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

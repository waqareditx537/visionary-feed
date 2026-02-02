import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

const ADMIN_SESSION_KEY = "downterest_admin_session";

export function useAdminAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (session) {
      try {
        setAdmin(JSON.parse(session));
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, email, name, role, password_hash, is_active")
      .eq("email", email)
      .single();

    if (error || !data) {
      throw new Error("Invalid credentials");
    }

    if (!data.is_active) {
      throw new Error("Account is disabled");
    }

    if (data.password_hash !== password) {
      throw new Error("Invalid credentials");
    }

    const adminUser: AdminUser = {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
    };

    // Update last login
    await supabase
      .from("admin_users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", data.id);

    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminUser));
    setAdmin(adminUser);
    return adminUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdmin(null);
  }, []);

  return { admin, loading, login, logout, isAuthenticated: !!admin };
}

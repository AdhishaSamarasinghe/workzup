"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type WorkzupAuthState = {
  loading: boolean;
  isAuthenticated: boolean;
};

export function useWorkzupAuth(): WorkzupAuthState {
  const [state, setState] = useState<WorkzupAuthState>({
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setState({
        loading: false,
        isAuthenticated: false,
      });
      return;
    }

    const syncSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;

        setState({
          loading: false,
          isAuthenticated: Boolean(data.session),
        });
      } catch {
        if (!active) return;
        setState({
          loading: false,
          isAuthenticated: false,
        });
      }
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState({
        loading: false,
        isAuthenticated: Boolean(session),
      });
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return state;
}

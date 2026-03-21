"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type WorkzupAuthState = {
  loading: boolean;
  isAuthenticated: boolean;
};

export function useWorkzupAuth(): WorkzupAuthState {
  const supabase = getSupabaseBrowserClient();
  const [state, setState] = useState<WorkzupAuthState>({
    loading: Boolean(supabase),
    isAuthenticated: false,
  });

  useEffect(() => {
    let active = true;

    if (!supabase) {
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
  }, [supabase]);

  return state;
}

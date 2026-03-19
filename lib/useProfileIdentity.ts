"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useWorkzupAuth } from "@/lib/auth/useWorkzupAuth";
import { resolveProfileAvatar } from "@/lib/profile";

type ProfileIdentity = {
  name: string;
  avatarUrl: string | null;
};

type ProfileUpdatedDetail = {
  name?: string;
  avatar?: string | null;
};

export function useProfileIdentity(fallbackName: string) {
  const { isAuthenticated } = useWorkzupAuth();
  const [identity, setIdentity] = useState<ProfileIdentity>({
    name: fallbackName,
    avatarUrl: null,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;

    const loadProfileIdentity = async () => {
      try {
        const profile = await apiFetch("/api/auth/profile");
        if (!isMounted) return;
        setIdentity({
          name: profile.name || fallbackName,
          avatarUrl: resolveProfileAvatar(profile.socialLinks?.avatarUrl || profile.avatar),
        });
      } catch {
        if (!isMounted) return;
        setIdentity((current) => ({
          name: current.name || fallbackName,
          avatarUrl: current.avatarUrl || null,
        }));
      }
    };

    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail || {};
      setIdentity((current) => ({
        name: detail.name || current.name || fallbackName,
        avatarUrl: detail.avatar ?? current.avatarUrl ?? null,
      }));
    };

    loadProfileIdentity();
    window.addEventListener("profile-updated", handleProfileUpdated as EventListener);

    return () => {
      isMounted = false;
      window.removeEventListener("profile-updated", handleProfileUpdated as EventListener);
    };
  }, [fallbackName, isAuthenticated]);

  return identity;
}

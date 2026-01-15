import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export default function useAuthUser() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    async function getAuthUser() {
      console.log("Getting auth user...");
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth error:", error);
        setError(error);
        setUserLoading(false);
        return;
      }

      console.log("User authenticated:", user?.id);
      setUser(user);
      setUserLoading(false);
    }

    getAuthUser();
  }, [supabase]);

  return { user, userLoading, error };
}

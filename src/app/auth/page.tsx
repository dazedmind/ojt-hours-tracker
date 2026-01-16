"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { FaGoogle } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        window.location.href = "/";
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        if (session) {
          window.location.href = "/";
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`;

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
    } catch (error) {
      console.error("Authentication error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            <img src="/lockin-logo.png" alt="LockIn Logo" className="w-20 h-20" />
            <p className="text-3xl font-bold">LockIn</p>
            <p className="text-md text-muted-foreground">Log your OJT Hours and track your progress</p>
          </div>
          <CardDescription>
            Sign in with your google account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full py-6 flex items-center justify-center gap-2 cursor-pointer"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <FaGoogle className="mr-2" />
            )}
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

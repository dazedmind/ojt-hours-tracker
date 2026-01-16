"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actionUpdateUserProfile } from "@/app/modules/users/actions";
import toast from "react-hot-toast";
import { createClient } from "@/utils/supabase/client";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [reqHours, setReqHours] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // Pre-fill name from user metadata if available
      if (user.user_metadata?.full_name) {
        setName(user.user_metadata.full_name);
      }

      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    const hours = parseInt(reqHours);
    if (isNaN(hours) || hours <= 0) {
      toast.error("Please enter valid required hours (greater than 0)");
      return;
    }

    setIsLoading(true);

    try {
      const { ok, message } = await actionUpdateUserProfile(name, hours);

      if (!ok) {
        toast.error(message || "Failed to update profile");
        setIsLoading(false);
        return;
      }

      toast.success("Profile completed successfully!");
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">Complete Your Profile</p>
            <p className="text-sm text-muted-foreground">Set up your profile to start tracking your OJT hours</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reqHours">Required OJT Hours</Label>
              <Input
                id="reqHours"
                type="number"
                className="rounded-full outline-none border-none shadow-none"
                min="1"
                placeholder="Enter required hours (e.g., 500)"
                value={reqHours}
                onChange={(e) => setReqHours(e.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                This is the total number of hours you need to complete for your OJT
              </p>
            </div>

            <Button
              type="submit"
              className="w-full py-6 rounded-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

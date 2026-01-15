import React from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import useAuthUser from "@/hooks/useAuthUser";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";

function NavBar() {
  const { user, userLoading } = useAuthUser();
  const onClickLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      return;
    }

    location.reload();
  };
  return (
    <div className="flex justify-between items-center py-6">
      <span className="flex items-center gap-2">
        <Image width={100} height={100} src="/lockin-logo.png" alt="LockIn Logo" className="w-10 h-10" />
        <h1 className="text-3xl font-bold text-center">LockIn</h1>
      </span>
 
      <div className="flex gap-3 items-center justify-center">
        <ThemeSwitcher />
        {userLoading ? (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Image
                width={100}
                height={100}
                src={user?.user_metadata.avatar_url}
                alt="user pic"
                className="h-8 w-8 rounded-full"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-center">
                  <Button variant="ghost" onClick={onClickLogout}>Logout</Button>
                </DropdownMenuLabel>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export default NavBar;

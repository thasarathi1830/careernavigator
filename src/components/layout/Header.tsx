
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useState } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      // Use signOut() method with proper error handling
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log("Successfully signed out");
        toast({
          title: "Success",
          description: "You have been signed out successfully."
        });

        // Force navigation to auth page after successful sign out
        setTimeout(() => {
          navigate("/auth", {
            replace: true
          });
        }, 100);
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2">
          <img 
            alt="CareerNavigator Logo" 
            className="w-8 h-8 object-fill" 
            src="/lovable-uploads/a4fdd853-ce6e-4faa-8029-8374f7f9ff0f.png" 
          />
          <p className="font-bold">
            CareerNavigator
          </p>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <ThemeToggle />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                >
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

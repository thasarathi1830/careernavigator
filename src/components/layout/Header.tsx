
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useState } from "react";

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
          variant: "destructive",
        });
      } else {
        console.log("Successfully signed out");
        toast({
          title: "Success",
          description: "You have been signed out successfully.",
        });
        
        // Force navigation to auth page after successful sign out
        setTimeout(() => {
          navigate("/auth", { replace: true });
        }, 100);
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <p className="mr-auto font-bold">
          CareerNavigator
        </p>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </Button>
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

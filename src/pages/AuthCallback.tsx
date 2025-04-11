
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the full URL
        const fullUrl = window.location.href;
        
        // Exchange code for session
        const { data, error: authError } = await supabase.auth.exchangeCodeForSession(fullUrl);
        
        if (authError) throw authError;
        if (!data.session) throw new Error("No session established");

        // Get profile status
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", data.session.user.id)
          .single();

        // Redirect based on onboarding status
        navigate(profile?.onboarding_completed ? "/dashboard" : "/onboarding", { replace: true });

      } catch (error: any) {
        console.error("Auth callback error:", error);
        setError(error.message);

        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to complete authentication.",
        });

        navigate("/auth", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500 text-lg">
        Authentication error: {error}
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center text-gray-600 text-lg">
      Completing authentication...
    </div>
  );
};

export default AuthCallback;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from URL if present
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          const params = new URLSearchParams(window.location.search);
          const errorDescription = params.get('error_description');
          if (errorDescription) {
            throw new Error(errorDescription);
          }
          throw new Error('Authentication failed - no session established');
        }

        // Check if user record exists
        const { data: userExists, error: userCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (userCheckError && userCheckError.code !== 'PGRST116') {
          throw userCheckError;
        }

        // Create user record if it doesn't exist
        if (!userExists) {
          const { error: createError } = await supabase
            .from('users')
            .insert([{
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || '',
              created_at: new Date().toISOString(),
              last_active_at: new Date().toISOString(),
            }]);

          if (createError) throw createError;
        }

        // Check existing onboarding status
        const { data: onboardingStatus, error: statusCheckError } = await supabase
          .from('onboarding_status')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (statusCheckError && statusCheckError.code !== 'PGRST116') {
          console.error("Error checking onboarding status:", statusCheckError);
        }

        // Only create if it doesn't exist
        if (!onboardingStatus) {
          const { error: onboardingError } = await supabase
            .from('onboarding_status')
            .insert([{
              user_id: session.user.id,
              is_complete: false
            }]);

          if (onboardingError) {
            console.error("Error creating onboarding status:", onboardingError);
          }
        }

        // Redirect to appropriate page
        const { data: onboardingCompletion } = await supabase
          .from('onboarding_status')
          .select('is_complete')
          .eq('user_id', session.user.id)
          .single();

        navigate(onboardingCompletion?.is_complete ? '/dashboard' : '/onboarding', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        setError(error.message);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Failed to complete authentication."
        });
        navigate('/auth', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  if (error) {
    return <div>Authentication error: {error}</div>;
  }

  return <div>Completing authentication...</div>;
};

export default AuthCallback;
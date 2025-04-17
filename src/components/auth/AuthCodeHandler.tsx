
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

/**
 * Component that handles OAuth code exchanges at any route
 * This is necessary for Vercel deployments where redirects may go to root
 */
const AuthCodeHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check if there's a code in the URL
    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    
    if (code) {
      const handleOAuthCode = async () => {
        try {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          
          if (error) throw error;
          if (!data.session) throw new Error('No session returned');
          
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', data.session.user.id)
            .single();
          
          // Create profile if it doesn't exist
          if (!profile) {
            await supabase.from('profiles').insert({
              id: data.session.user.id,
              email: data.session.user.email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
          
          // Redirect based on onboarding status
          if (profile?.onboarding_completed) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        } catch (error: any) {
          console.error('Auth code handling error:', error);
          toast({
            variant: "destructive",
            title: "Authentication Failed",
            description: error.message
          });
          navigate('/auth', { replace: true });
        }
      };
      
      handleOAuthCode();
    }
  }, [location, navigate, toast]);
  
  return null; // This component doesn't render anything
};

export default AuthCodeHandler;

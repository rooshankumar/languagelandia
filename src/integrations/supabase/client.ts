// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yekzyvdjjozhhatdefsq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlla3p5dmRqam96aGhhdGRlZnNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDk5NjEsImV4cCI6MjA1ODI4NTk2MX0.6z2QW9PnENnT9knd9oK8Sbqf2JhN1NsKIKs6hG4vM8Q";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
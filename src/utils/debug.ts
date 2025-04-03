
import { supabase } from '../lib/supabase';

export async function debugSupabaseSchema() {
  try {
    // Check conversations table schema
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    console.log("Conversations schema test:", { data, error });
    
    // Try specific column query
    const { data: creatorTest, error: creatorError } = await supabase
      .from('conversations')
      .select('creator_id')
      .limit(1);
    
    console.log("Creator ID test:", { creatorTest, creatorError });
    
    // Test conversation participants query
    const { data: participantTest, error: participantError } = await supabase
      .from('conversation_participants')
      .select(`
        user_id,
        users:users!conversation_participants_user_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .limit(1);
    
    console.log("Participant relationship test:", { participantTest, participantError });
    
    // Test foreign key relationships
    const { data: fkTest, error: fkError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .limit(1);
      
    console.log("Foreign key test:", { fkTest, fkError });
    
    return { 
      success: true, 
      data: { data, creatorTest, participantTest, fkTest }, 
      error: error || creatorError || participantError || fkError 
    };
  } catch (err) {
    console.error("Debug error:", err);
    return { success: false, error: err };
  }
}

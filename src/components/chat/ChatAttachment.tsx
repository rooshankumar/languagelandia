import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react'; // Import Loader2

interface ChatAttachmentProps {
  onAttach: (url: string, filename: string) => void;
}

export const ChatAttachment = ({ onAttach }: ChatAttachmentProps) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select a file to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = await supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      onAttach(data.publicUrl, file.name);

      // Reset the input after successful upload
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploading}
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-[60px] w-[60px] rounded-2xl hover:bg-muted/50"
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Paperclip className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};
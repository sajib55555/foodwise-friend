
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (
    bucket: string,
    path: string,
    file: File,
    options?: {
      upsert?: boolean;
      contentType?: string;
    }
  ) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: options?.upsert ?? false,
          contentType: options?.contentType,
        });

      if (error) throw error;

      setUploadProgress(100);
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error during upload'));
      console.error('Error uploading file:', err);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const getPublicUrl = (bucket: string, path: string) => {
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };

  const downloadFile = async (bucket: string, path: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.storage.from(bucket).download(path);
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error during download'));
      console.error('Error downloading file:', err);
      return null;
    }
  };

  const removeFile = async (bucket: string, paths: string[]) => {
    try {
      setError(null);
      const { data, error } = await supabase.storage.from(bucket).remove(paths);
      
      if (error) throw error;
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error during file removal'));
      console.error('Error removing file:', err);
      return null;
    }
  };

  return {
    uploadFile,
    getPublicUrl,
    downloadFile,
    removeFile,
    isUploading,
    uploadProgress,
    error,
  };
};

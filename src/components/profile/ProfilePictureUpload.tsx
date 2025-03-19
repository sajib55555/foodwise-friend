
import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button-custom";
import { Camera, Upload, X, Image, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useActivityLog } from "@/contexts/ActivityLogContext";

interface ProfilePictureUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const { logActivity } = useActivityLog();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async () => {
    if (!user || !preview) return;
    
    try {
      setUploading(true);
      
      // Convert the preview to a Blob
      const response = await fetch(preview);
      const blob = await response.blob();
      
      // Create a unique filename
      const fileExt = '.jpg';
      const fileName = `${user.id}${fileExt}`;
      const filePath = `${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          upsert: true,
          contentType: 'image/jpeg'
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Log activity
      await logActivity('profile_updated', 'Updated profile picture');
      
      onSuccess();
    } catch (error: any) {
      console.error('Error uploading avatar:', error.message);
    } finally {
      setUploading(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            {preview ? (
              <div className="relative w-32 h-32">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-200"
                />
                <button 
                  onClick={() => setPreview(null)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div 
                onClick={triggerFileInput}
                className="w-32 h-32 rounded-full bg-muted flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-muted-foreground/50 hover:border-primary/50 transition-colors"
              >
                <Camera size={24} className="text-muted-foreground mb-2" />
                <span className="text-xs text-muted-foreground">Select Photo</span>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <div className="flex justify-center gap-4">
            {!preview ? (
              <Button
                onClick={triggerFileInput}
                variant="outline"
                className="gap-2"
              >
                <Upload size={16} />
                Upload Photo
              </Button>
            ) : (
              <Button
                onClick={handleUpload}
                variant="purple-gradient"
                className="gap-2"
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Image size={16} />
                )}
                Save Profile Picture
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureUpload;

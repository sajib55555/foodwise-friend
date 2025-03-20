
import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button-custom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ProfilePictureUploadProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ 
  onClose = () => {},
  onSuccess = () => {}
}) => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    try {
      setIsUploading(true);
      console.log('Starting upload...');
      
      // Upload file to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `profiles/${fileName}`;
      
      console.log('Uploading to path:', filePath);
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      console.log('Upload successful');
      
      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const avatarUrl = data.publicUrl;
      console.log('Avatar URL:', avatarUrl);
      
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });
      
      if (updateError) {
        console.error('Update user error:', updateError);
        throw updateError;
      }
      
      console.log('User updated successfully');
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);
      
      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }
      
      await refreshUser();
      
      toast({
        title: 'Success',
        description: 'Profile picture updated successfully'
      });
      
      setFile(null);
      setPreview(null);
      setShowDialog(false);
      onSuccess();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was a problem uploading your profile picture',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setPreview(null);
    setShowDialog(false);
    onClose();
  };

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const containerStyles = { cursor: 'pointer' };

  return (
    <>
      <div 
        className="relative" 
        style={containerStyles} 
        onClick={handleOpenDialog}
      >
        <Avatar className="h-24 w-24 border-2 border-primary/10">
          <AvatarImage 
            src={user?.user_metadata?.avatar_url} 
            alt={user?.user_metadata?.full_name || "User"} 
          />
          <AvatarFallback className="bg-primary/10">
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 hover:opacity-100 transition-opacity">
          <Upload className="h-6 w-6 text-white" />
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4">
            {preview ? (
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={preview} alt="Preview" />
                </Avatar>
                <Button 
                  size="icon" 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 rounded-full h-6 w-6 p-0"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Avatar className="h-32 w-32 bg-muted">
                <AvatarFallback>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
            )}
            
            {!preview && (
              <div className="mt-2">
                <label 
                  htmlFor="avatar-upload" 
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Select Image
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
              {preview && (
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfilePictureUpload;

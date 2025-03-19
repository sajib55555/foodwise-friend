
import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import MobileNavbar from "@/components/layout/MobileNavbar";
import PageTransition from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useActivityLog } from "@/contexts/ActivityLogContext";
import ProfilePictureUpload from "@/components/profile/ProfilePictureUpload";

const PersonalInfo = () => {
  const { user, profile, getProfile } = useAuth();
  const { logActivity } = useActivityLog();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    weight: profile?.weight || "",
    height: profile?.height || "",
    goal: profile?.goal || ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update profile data
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          weight: formData.weight,
          height: formData.height,
          goal: formData.goal,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Log activity
      await logActivity('profile_updated', 'Updated personal information');
      
      // Update local profile data
      await getProfile();
      
      toast({
        title: "Profile updated",
        description: "Your personal information has been updated successfully.",
      });
      
      navigate("/profile");
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "There was a problem updating your profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Personal Information" showBackButton />
      <PageTransition>
        <main className="flex-1 container mx-auto px-4 pb-24 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-col items-center pb-6">
                <div className="mb-4 relative cursor-pointer group" onClick={() => setShowUploadModal(true)}>
                  <Avatar className="w-20 h-20 border-2 border-purple-200/50">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl">
                        {(profile?.full_name || user?.email?.charAt(0) || "U").toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle>Edit Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input 
                      id="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      defaultValue={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input 
                      id="weight"
                      type="text"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="e.g. 70kg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input 
                      id="height"
                      type="text"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="e.g. 175cm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal</Label>
                    <Input 
                      id="goal"
                      type="text"
                      value={formData.goal}
                      onChange={handleChange}
                      placeholder="e.g. Lose weight, gain muscle"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/profile")}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={loading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </PageTransition>
      <MobileNavbar />
      
      {showUploadModal && (
        <ProfilePictureUpload 
          onClose={() => setShowUploadModal(false)} 
          onSuccess={() => {
            setShowUploadModal(false);
            getProfile();
            toast({
              title: "Profile picture updated",
              description: "Your profile picture has been updated successfully.",
            });
          }}
        />
      )}
    </>
  );
};

export default PersonalInfo;

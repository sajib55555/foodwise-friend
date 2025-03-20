
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, User, Bell, LogOut, Shield, MessageSquare, CreditCard } from 'lucide-react';
import Header from '@/components/layout/Header';
import MobileNavbar from '@/components/layout/MobileNavbar';
import PageTransition from '@/components/layout/PageTransition';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card-custom';
import { Button } from '@/components/ui/button-custom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const menuItems = [
    {
      icon: <User className="h-5 w-5" />,
      title: 'Personal Information',
      description: 'Update your personal details',
      action: () => navigate('/profile/edit'),
    },
    {
      icon: <Bell className="h-5 w-5" />,
      title: 'Notifications',
      description: 'Configure your notification preferences',
      action: () => navigate('/profile/notifications'),
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Privacy',
      description: 'Manage your privacy settings',
      action: () => navigate('/profile/privacy'),
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: 'Subscription',
      description: 'Manage your subscription plan',
      action: () => navigate('/profile/subscription'),
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: 'Settings',
      description: 'App preferences and settings',
      action: () => navigate('/profile/settings'),
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: 'Help & Support',
      description: 'Get help or contact support',
      action: () => navigate('/profile/support'),
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed out successfully',
        description: 'You have been logged out',
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign out failed',
        description: 'There was a problem signing you out',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Header title="Profile" />
      <PageTransition>
        <main className="container mx-auto px-4 pb-24 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center mb-8"
          >
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || "User"} />
              <AvatarFallback>{user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{user?.user_metadata?.full_name || "User"}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            {menuItems.map((item, index) => (
              <Card
                key={index}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={item.action}
              >
                <CardContent className="flex items-center p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {item.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </motion.div>
        </main>
      </PageTransition>
      <MobileNavbar />
    </>
  );
};

export default Profile;

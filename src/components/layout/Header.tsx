
import React from "react";
import { Button } from "@/components/ui/button-custom";
import { ArrowLeft, User, Bell } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBackButton = false,
  transparent = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn(
        "sticky top-0 z-30 w-full backdrop-blur-md backdrop-saturate-150 transition-all",
        transparent ? "bg-transparent" : "bg-background/70 border-b border-border/40"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon-sm"
              className="mr-2" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {title && (
            <h1 className="text-lg font-semibold">{title}</h1>
          )}
          {!title && !showBackButton && isHomePage && (
            <div className="flex items-center">
              <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-health-600 to-health-500">
                FoodWise
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/notifications')}>
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/profile')}>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

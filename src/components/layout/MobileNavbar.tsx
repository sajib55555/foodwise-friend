
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Camera, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MobileNavbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => {
    // Consider paths like /log-meal to match with their parent actions
    if (path === "/plans" && location.pathname === "/plans") return true;
    if (path === "/scan" && location.pathname === "/log-meal") return true;
    return location.pathname === path;
  };

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/scan", icon: Camera, label: "Scan" },
    { path: "/nutrition", icon: BarChart3, label: "Nutrition" },
    { path: "/profile", icon: Settings, label: "Profile" }
  ];

  return (
    <motion.nav 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 z-30 bg-background/70 border-t border-border/40 backdrop-blur-lg backdrop-saturate-150"
    >
      <div className="container mx-auto px-4 py-1">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavItem 
              key={item.path}
              path={item.path}
              Icon={item.icon}
              label={item.label}
              isActive={isActive(item.path)}
            />
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

interface NavItemProps {
  path: string;
  Icon: React.FC<{ className?: string }>;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ path, Icon, label, isActive }) => {
  return (
    <Link 
      to={path} 
      className={cn(
        "flex flex-col items-center justify-center py-2 px-4 text-xs transition-colors duration-200",
        isActive 
          ? "text-purple-600" 
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <div className="relative">
        <Icon className={cn("h-6 w-6 mb-1", isActive && "stroke-[2.5px]")} />
        {isActive && (
          <motion.div
            layoutId="navIndicator"
            className="absolute -bottom-1.5 left-0 right-0 mx-auto w-1 h-1 bg-purple-600 rounded-full"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </div>
      <span className={cn("font-medium", isActive && "font-semibold")}>{label}</span>
    </Link>
  );
};

export default MobileNavbar;

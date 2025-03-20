
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Camera, BarChart3, Settings, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MobileNavbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => {
    // Consider paths like /log-meal to match with their parent actions
    if (path === "/plans" && location.pathname === "/plans") return true;
    if (path === "/scan" && location.pathname === "/log-meal") return true;
    if (path === "/goals" && location.pathname === "/goals") return true;
    return location.pathname === path;
  };

  const navItems = [
    { 
      path: "/", 
      icon: Home, 
      label: "Home",
      activeColor: "text-purple-600",
      inactiveColor: "text-purple-500",
      gradientClass: "bg-gradient-to-br from-purple-400 to-purple-600",
      inactiveGradient: "bg-gradient-to-br from-purple-300 to-purple-400",
      indicatorClass: "bg-purple-600"
    },
    { 
      path: "/scan", 
      icon: Camera, 
      label: "Scan",
      activeColor: "text-blue-600",
      inactiveColor: "text-blue-500",
      gradientClass: "bg-gradient-to-br from-blue-400 to-blue-600",
      inactiveGradient: "bg-gradient-to-br from-blue-300 to-blue-400",
      indicatorClass: "bg-blue-600"
    },
    { 
      path: "/goals", 
      icon: Target, 
      label: "Goals",
      activeColor: "text-teal-600",
      inactiveColor: "text-teal-500",
      gradientClass: "bg-gradient-to-br from-teal-400 to-teal-600", 
      inactiveGradient: "bg-gradient-to-br from-teal-300 to-teal-400",
      indicatorClass: "bg-teal-600"
    },
    { 
      path: "/nutrition", 
      icon: BarChart3, 
      label: "Nutrition",
      activeColor: "text-green-600",
      inactiveColor: "text-green-500",
      gradientClass: "bg-gradient-to-br from-green-400 to-green-600", 
      inactiveGradient: "bg-gradient-to-br from-green-300 to-green-400",
      indicatorClass: "bg-green-600"
    },
    { 
      path: "/profile", 
      icon: Settings, 
      label: "Profile",
      activeColor: "text-amber-600",
      inactiveColor: "text-amber-500",
      gradientClass: "bg-gradient-to-br from-amber-400 to-amber-600",
      inactiveGradient: "bg-gradient-to-br from-amber-300 to-amber-400",
      indicatorClass: "bg-amber-600"
    }
  ];

  return (
    <motion.nav 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 z-30 bg-background/90 border-t border-border/40 backdrop-blur-xl backdrop-saturate-150 py-1"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavItem 
              key={item.path}
              path={item.path}
              Icon={item.icon}
              label={item.label}
              isActive={isActive(item.path)}
              activeColor={item.activeColor}
              inactiveColor={item.inactiveColor}
              gradientClass={item.gradientClass}
              inactiveGradient={item.inactiveGradient}
              indicatorClass={item.indicatorClass}
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
  activeColor: string;
  inactiveColor: string;
  gradientClass: string;
  inactiveGradient: string;
  indicatorClass: string;
}

const NavItem: React.FC<NavItemProps> = ({ 
  path, 
  Icon, 
  label, 
  isActive,
  activeColor,
  inactiveColor,
  gradientClass,
  inactiveGradient,
  indicatorClass
}) => {
  return (
    <Link 
      to={path} 
      className={cn(
        "flex flex-col items-center justify-center py-2 px-4 text-xs transition-colors duration-200",
        isActive 
          ? activeColor
          : inactiveColor
      )}
    >
      <div className="relative">
        {isActive ? (
          <div className={`p-2 rounded-full ${gradientClass} shadow-sm`}>
            <Icon className="h-5 w-5 text-white stroke-[2.5px]" />
          </div>
        ) : (
          <div className={`p-2 rounded-full ${inactiveGradient}`}>
            <Icon className="h-5 w-5 text-white stroke-[2px]" />
          </div>
        )}
        {isActive && (
          <motion.div
            layoutId="navIndicator"
            className={`absolute -bottom-1.5 left-0 right-0 mx-auto w-1 h-1 ${indicatorClass} rounded-full`}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </div>
      <span className={cn(
        "font-medium mt-1", 
        isActive && "font-semibold"
      )}>
        {label}
      </span>
    </Link>
  );
};

export default MobileNavbar;

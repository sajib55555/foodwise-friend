
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  LogIn, LogOut, Eye, Target, Award, Utensils, 
  Dumbbell, Scale, Camera, UserCheck, 
  CalendarClock, Filter, RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button-custom';
import { ActivityType } from '@/contexts/ActivityLogContext';

type ActivityFilters = 'all' | 'login' | 'workout' | 'meal' | 'profile' | 'goal';

interface ActivityHistoryProps {
  limit?: number;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({ limit = 10 }) => {
  const { getUserActivities } = useActivityLog();
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityFilters>('all');

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const data = await getUserActivities(30); // Fetch more to allow for filtering
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'login': return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout': return <LogOut className="h-4 w-4 text-red-500" />;
      case 'view_page': return <Eye className="h-4 w-4 text-blue-500" />;
      case 'goal_created': return <Target className="h-4 w-4 text-purple-500" />;
      case 'goal_updated': return <Target className="h-4 w-4 text-indigo-500" />;
      case 'goal_completed': return <Award className="h-4 w-4 text-yellow-500" />;
      case 'meal_logged': return <Utensils className="h-4 w-4 text-orange-500" />;
      case 'workout_logged': return <Dumbbell className="h-4 w-4 text-cyan-500" />;
      case 'workout_deleted': return <Dumbbell className="h-4 w-4 text-red-500" />;
      case 'weight_logged': return <Scale className="h-4 w-4 text-teal-500" />;
      case 'weight_deleted': return <Scale className="h-4 w-4 text-red-500" />;
      case 'scan_food': return <Camera className="h-4 w-4 text-pink-500" />;
      case 'profile_updated': return <UserCheck className="h-4 w-4 text-emerald-500" />;
      default: return <CalendarClock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'login': 
      case 'signup': 
        return 'bg-green-50 border-green-100 dark:bg-green-900/20';
      case 'logout': 
        return 'bg-red-50 border-red-100 dark:bg-red-900/20';
      case 'view_page': 
        return 'bg-blue-50 border-blue-100 dark:bg-blue-900/20';
      case 'goal_created':
      case 'goal_updated':
      case 'goal_completed':
        return 'bg-purple-50 border-purple-100 dark:bg-purple-900/20';
      case 'meal_logged':
        return 'bg-orange-50 border-orange-100 dark:bg-orange-900/20';
      case 'workout_logged':
      case 'workout_deleted':
        return 'bg-cyan-50 border-cyan-100 dark:bg-cyan-900/20';
      case 'weight_logged':
      case 'weight_deleted':
        return 'bg-teal-50 border-teal-100 dark:bg-teal-900/20';
      case 'scan_food':
        return 'bg-pink-50 border-pink-100 dark:bg-pink-900/20';
      case 'profile_updated':
        return 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20';
      default:
        return 'bg-gray-50 border-gray-100 dark:bg-gray-800/30';
    }
  };

  const getFilteredActivities = () => {
    if (filter === 'all') return activities;
    
    return activities.filter(activity => {
      const type = activity.activity_type;
      switch (filter) {
        case 'login': return type === 'login' || type === 'logout' || type === 'signup';
        case 'workout': return type === 'workout_logged' || type === 'workout_deleted';
        case 'meal': return type === 'meal_logged' || type === 'scan_food';
        case 'profile': return type === 'profile_updated';
        case 'goal': return type === 'goal_created' || type === 'goal_updated' || type === 'goal_completed';
        default: return true;
      }
    });
  };

  const filteredActivities = getFilteredActivities().slice(0, limit);

  return (
    <Card variant="glass">
      <CardHeader className="py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Activity History</CardTitle>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex gap-1">
            <Button
              variant={filter === 'all' ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter('all')}
              className="text-xs py-1"
            >
              All
            </Button>
            <Button
              variant={filter === 'login' ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter('login')}
              className="text-xs py-1"
            >
              Login
            </Button>
            <Button
              variant={filter === 'workout' ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter('workout')}
              className="text-xs py-1"
            >
              Workout
            </Button>
            <Button
              variant={filter === 'meal' ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter('meal')}
              className="text-xs py-1"
            >
              Meals
            </Button>
            <Button
              variant={filter === 'profile' ? "default" : "outline"}
              size="xs"
              onClick={() => setFilter('profile')}
              className="text-xs py-1"
            >
              Profile
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={loadActivities}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={() => {
              const filters: ActivityFilters[] = ['all', 'login', 'workout', 'meal', 'profile', 'goal'];
              const currentIndex = filters.indexOf(filter);
              const nextIndex = (currentIndex + 1) % filters.length;
              setFilter(filters[nextIndex]);
            }}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No activity data found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredActivities.map((activity) => (
              <div 
                key={activity.id} 
                className={`rounded-md border p-2 flex items-center text-sm ${getActivityColor(activity.activity_type)}`}
              >
                <div className="w-8 h-8 flex items-center justify-center mr-3">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{activity.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground hidden md:block">
                  {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;

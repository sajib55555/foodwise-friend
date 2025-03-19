import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useActivityLog } from "@/contexts/ActivityLogContext";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card-custom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Activity, PieChart, FileText, User, Weight, Dumbbell, Salad, Target, Bell, Settings } from "lucide-react";

interface ActivityLog {
  id: string;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
}

const ActivityHistory: React.FC = () => {
  const { getUserActivities } = useActivityLog();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const data = await getUserActivities(30); // Reduced to 30 recent activities
      setActivities(data);
      setLoading(false);
    };

    fetchActivities();
  }, [getUserActivities]);

  const filteredActivities = activeFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.activity_type === activeFilter);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
      case 'signup':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'logout':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'view_page':
        return <FileText className="h-4 w-4 text-indigo-500" />;
      case 'profile_updated':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'goal_created':
      case 'goal_updated':
      case 'goal_completed':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'meal_logged':
        return <Salad className="h-4 w-4 text-emerald-500" />;
      case 'workout_logged':
        return <Dumbbell className="h-4 w-4 text-pink-500" />;
      case 'weight_logged':
        return <Weight className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'login':
        return <Badge variant="outline" className="bg-blue-50/80 text-blue-600 border-blue-200">{type}</Badge>;
      case 'signup':
        return <Badge variant="outline" className="bg-indigo-50/80 text-indigo-600 border-indigo-200">{type}</Badge>;
      case 'logout':
        return <Badge variant="outline" className="bg-gray-50/80 text-gray-600 border-gray-200">{type}</Badge>;
      case 'view_page':
        return <Badge variant="outline" className="bg-slate-50/80 text-slate-600 border-slate-200">View</Badge>;
      case 'profile_updated':
        return <Badge variant="outline" className="bg-purple-50/80 text-purple-600 border-purple-200">Profile</Badge>;
      case 'goal_created':
        return <Badge variant="outline" className="bg-green-50/80 text-green-600 border-green-200">New Goal</Badge>;
      case 'goal_updated':
        return <Badge variant="outline" className="bg-emerald-50/80 text-emerald-600 border-emerald-200">Goal</Badge>;
      case 'goal_completed':
        return <Badge variant="outline" className="bg-teal-50/80 text-teal-600 border-teal-200">Completed</Badge>;
      case 'meal_logged':
        return <Badge variant="outline" className="bg-amber-50/80 text-amber-600 border-amber-200">Meal</Badge>;
      case 'workout_logged':
        return <Badge variant="outline" className="bg-rose-50/80 text-rose-600 border-rose-200">Workout</Badge>;
      case 'weight_logged':
        return <Badge variant="outline" className="bg-orange-50/80 text-orange-600 border-orange-200">Weight</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatActivityTime = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    
    // If same day, just show time
    if (date.toDateString() === today.toDateString()) {
      return format(date, "h:mm a");
    }
    
    // If within the last 7 days, show day name and time
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return format(date, "EEE h:mm a");
    }
    
    // Otherwise show date
    return format(date, "MMM d");
  };

  return (
    <Card className="overflow-hidden border-purple-200/20 dark:border-purple-800/20">
      <CardHeader className="pb-2 px-4 pt-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" onValueChange={setActiveFilter} className="w-full">
          <TabsList className="w-full grid grid-cols-4 rounded-none px-4 py-2">
            <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
            <TabsTrigger value="profile_updated" className="text-xs h-7">Profile</TabsTrigger>
            <TabsTrigger value="meal_logged" className="text-xs h-7">Food</TabsTrigger>
            <TabsTrigger value="workout_logged" className="text-xs h-7">Fitness</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeFilter} className="mt-0">
            {loading ? (
              <div className="flex justify-center p-3">
                <span className="text-xs text-muted-foreground">Loading activities...</span>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="h-6 w-6 mx-auto text-muted-foreground opacity-30" />
                <p className="mt-1 text-xs text-muted-foreground">No activities recorded yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[250px]">
                <div className="px-2">
                  {filteredActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-2 p-2 border-b border-border/30 hover:bg-muted/20 transition-colors rounded-md"
                    >
                      <div className="mt-1 w-6 h-6 rounded-full bg-primary/5 flex items-center justify-center">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className="text-xs font-medium truncate">{activity.description}</p>
                          <div className="flex items-center">
                            <span className="text-xs text-muted-foreground">
                              {formatActivityTime(activity.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-0.5">
                          {getActivityBadge(activity.activity_type)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActivityHistory;

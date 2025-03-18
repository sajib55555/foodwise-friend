
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useActivityLog } from "@/contexts/ActivityLogContext";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card-custom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Activity, PieChart, FileText } from "lucide-react";

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
      const data = await getUserActivities(100);
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
      case 'logout':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'goal_created':
      case 'goal_updated':
      case 'goal_completed':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'meal_logged':
      case 'workout_logged':
      case 'weight_logged':
        return <PieChart className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadge = (type: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    switch (type) {
      case 'login':
      case 'signup':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">{type}</Badge>;
      case 'logout':
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">{type}</Badge>;
      case 'goal_created':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">New Goal</Badge>;
      case 'goal_updated':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Goal Progress</Badge>;
      case 'goal_completed':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Goal Completed</Badge>;
      case 'meal_logged':
        return <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">Meal</Badge>;
      case 'workout_logged':
        return <Badge variant="outline" className="bg-pink-50 text-pink-600 border-pink-200">Workout</Badge>;
      case 'weight_logged':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200">Weight</Badge>;
      case 'view_page':
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Page View</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Activity History</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveFilter}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="goal_updated">Goals</TabsTrigger>
            <TabsTrigger value="meal_logged">Nutrition</TabsTrigger>
            <TabsTrigger value="workout_logged">Fitness</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeFilter} className="mt-0">
            {loading ? (
              <div className="flex justify-center p-6">
                <span className="text-sm text-muted-foreground">Loading activities...</span>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-10">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
                <p className="mt-2 text-sm text-muted-foreground">No activities recorded yet</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-3 border-b border-border pb-3"
                    >
                      <div className="mt-0.5">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <div>
                            {getActivityBadge(activity.activity_type)}
                          </div>
                        </div>
                        
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                            {Object.entries(activity.metadata)
                              .filter(([key]) => !key.includes('id') && key !== 'path')
                              .map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key.replace(/_/g, ' ')}</span>: {String(value)}
                                </div>
                              ))}
                          </div>
                        )}
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

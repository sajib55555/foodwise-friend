
import React, { useMemo } from 'react';
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card-custom";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  formattedDate: string;
}

interface WeightStatsCardsProps {
  weightEntries: WeightEntry[];
}

const WeightStatsCards: React.FC<WeightStatsCardsProps> = ({ weightEntries }) => {
  const stats = useMemo(() => {
    if (weightEntries.length === 0) return null;

    // Sort entries by date
    const sortedEntries = [...weightEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstEntry = sortedEntries[0];
    const latestEntry = sortedEntries[sortedEntries.length - 1];
    
    // Calculate total change since start
    const totalChange = latestEntry.weight - firstEntry.weight;
    const totalChangePercentage = (totalChange / firstEntry.weight) * 100;
    
    // Calculate weekly change (if we have at least 2 entries)
    let weeklyChange = 0;
    let weeklyChangePercentage = 0;
    
    if (sortedEntries.length >= 2) {
      const prevEntry = sortedEntries[sortedEntries.length - 2];
      weeklyChange = latestEntry.weight - prevEntry.weight;
      weeklyChangePercentage = (weeklyChange / prevEntry.weight) * 100;
    }
    
    return {
      current: latestEntry.weight,
      initial: firstEntry.weight,
      totalChange,
      totalChangePercentage,
      weeklyChange,
      weeklyChangePercentage
    };
  }, [weightEntries]);

  if (!stats) {
    return null;
  }

  const { current, initial, totalChange, totalChangePercentage, weeklyChange, weeklyChangePercentage } = stats;

  const totalTrend = totalChange === 0 ? 'neutral' : totalChange < 0 ? 'down' : 'up';
  const weeklyTrend = weeklyChange === 0 ? 'neutral' : weeklyChange < 0 ? 'down' : 'up';

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Current Weight</p>
              {weeklyTrend === 'down' && <ArrowDown className="h-4 w-4 text-green-500" />}
              {weeklyTrend === 'up' && <ArrowUp className="h-4 w-4 text-red-500" />}
              {weeklyTrend === 'neutral' && <Minus className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-semibold">{current.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground mb-0.5">kg</span>
            </div>
            <div className={`text-xs ${
              weeklyTrend === 'down' ? 'text-green-500' : 
              weeklyTrend === 'up' ? 'text-red-500' : 
              'text-muted-foreground'
            }`}>
              {weeklyChange !== 0 ? (
                <>
                  {weeklyChange < 0 ? '-' : '+'}{Math.abs(weeklyChange).toFixed(1)} kg
                  <span className="ml-1">
                    ({weeklyChangePercentage < 0 ? '' : '+'}{weeklyChangePercentage.toFixed(1)}%)
                  </span>
                </>
              ) : (
                <>No change</>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Total Progress</p>
              {totalTrend === 'down' && <TrendingDown className="h-4 w-4 text-green-500" />}
              {totalTrend === 'up' && <TrendingUp className="h-4 w-4 text-red-500" />}
              {totalTrend === 'neutral' && <Minus className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-semibold">{Math.abs(totalChange).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground mb-0.5">kg</span>
            </div>
            <div className={`text-xs ${
              totalTrend === 'down' ? 'text-green-500' : 
              totalTrend === 'up' ? 'text-red-500' : 
              'text-muted-foreground'
            }`}>
              {totalChange !== 0 ? (
                <>
                  {totalChange < 0 ? 'Lost' : 'Gained'} {Math.abs(totalChange).toFixed(1)} kg
                  <span className="ml-1">
                    ({totalChangePercentage < 0 ? '' : '+'}{totalChangePercentage.toFixed(1)}%)
                  </span>
                </>
              ) : (
                <>No change since start</>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeightStatsCards;

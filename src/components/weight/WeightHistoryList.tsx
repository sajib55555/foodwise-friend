
import React from 'react';
import { format, parseISO } from 'date-fns';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card-custom";
import { Button } from "@/components/ui/button-custom";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  formattedDate: string;
}

interface WeightHistoryListProps {
  weightEntries: WeightEntry[];
  onDelete: (id: string) => void;
}

const WeightHistoryList: React.FC<WeightHistoryListProps> = ({ weightEntries, onDelete }) => {
  // Sort entries by date in descending order (newest first)
  const sortedEntries = [...weightEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Weight History</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEntries.length > 0 ? (
          <div className="space-y-3">
            {sortedEntries.map((entry, index) => {
              // Calculate weight change
              const prevEntry = index < sortedEntries.length - 1 ? sortedEntries[index + 1] : null;
              const weightChange = prevEntry ? entry.weight - prevEntry.weight : 0;
              const changeText = weightChange.toFixed(1);
              const isWeightUp = weightChange > 0;
              const isWeightSame = weightChange === 0;
              
              return (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-purple-100/20"
                >
                  <div>
                    <p className="font-medium">{format(parseISO(entry.date), 'MMMM d, yyyy')}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-2xl font-semibold">{entry.weight.toFixed(1)}</p>
                      <span className="text-sm text-muted-foreground">kg</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {prevEntry && (
                      <div className={`flex items-center ${
                        isWeightUp ? 'text-red-500' : isWeightSame ? 'text-gray-500' : 'text-green-500'
                      }`}>
                        {isWeightUp ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : isWeightSame ? (
                          <span className="text-sm mr-1">•</span>
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        <span className="text-sm font-medium">{`${Math.abs(weightChange).toFixed(1)} kg`}</span>
                      </div>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No weight entries yet</p>
            <p className="text-sm">Add your first weight measurement to start tracking</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightHistoryList;

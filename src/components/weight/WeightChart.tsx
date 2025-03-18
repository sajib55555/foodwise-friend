
import React from 'react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  formattedDate: string;
}

interface WeightChartProps {
  weightEntries: WeightEntry[];
}

const WeightChart: React.FC<WeightChartProps> = ({ weightEntries }) => {
  // Sort entries by date
  const sortedEntries = [...weightEntries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="w-full h-64 md:h-80">
      <ChartContainer
        config={{
          weight: {
            label: "Weight",
            color: "#9b87f5",
          },
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={sortedEntries}
            margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <ChartTooltipContent
                      className="bg-background border border-border shadow-lg"
                      payload={payload}
                    />
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              name="weight"
              stroke="#9b87f5"
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default WeightChart;

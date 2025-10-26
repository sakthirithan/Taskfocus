import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, CheckCircle, Clock } from "lucide-react";
import { Task } from "@/types/task";

interface StatsCardProps {
  tasks: Task[];
  totalTimeToday: number;
}

export const StatsCard = ({ tasks, totalTimeToday }: StatsCardProps) => {
  const completedTasks = tasks.filter(t => t.completed).length;
  const activeTasks = tasks.filter(t => !t.completed).length;
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const stats = [
    {
      icon: Clock,
      label: "Total Focus Time",
      value: formatTime(totalTimeToday),
      color: "text-primary"
    },
    {
      icon: CheckCircle,
      label: "Completed Tasks",
      value: completedTasks.toString(),
      color: "text-green-600"
    },
    {
      icon: BarChart3,
      label: "Active Tasks",
      value: activeTasks.toString(),
      color: "text-accent"
    }
  ];

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Focus Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg border border-border animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Icon className={`h-8 w-8 mb-2 ${stat.color}`} />
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground text-center mt-1">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

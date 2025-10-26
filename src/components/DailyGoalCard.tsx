import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { useState } from "react";

interface DailyGoalCardProps {
  dailyGoalMinutes: number;
  totalTimeToday: number;
  onUpdateGoal: (minutes: number) => void;
}

export const DailyGoalCard = ({ dailyGoalMinutes, totalTimeToday, onUpdateGoal }: DailyGoalCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState((dailyGoalMinutes / 60).toString());

  const progress = Math.min((totalTimeToday / (dailyGoalMinutes * 60)) * 100, 100);
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleSaveGoal = () => {
    const hours = parseFloat(goalInput);
    if (hours > 0) {
      onUpdateGoal(Math.round(hours * 60));
      setIsEditing(false);
    }
  };

  return (
    <Card className="bg-gradient-hero border-0 text-white shadow-glow-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Target className="h-6 w-6" />
          Today's Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="dailyGoal" className="text-white/90">Daily Goal (hours)</Label>
              <Input
                id="dailyGoal"
                type="number"
                step="0.5"
                min="0.5"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveGoal} variant="secondary" size="sm" className="flex-1">
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" size="sm" className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {formatTime(totalTimeToday)}
              </div>
              <div className="text-white/80 text-lg">
                of {formatTime(dailyGoalMinutes * 60)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/80">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-white h-4 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Update Goal
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer } from "lucide-react";

interface PomodoroSettingsProps {
  isPomodoroMode: boolean;
  focusDuration: number;
  breakDuration: number;
  onTogglePomodoro: (enabled: boolean) => void;
  onUpdateSettings: (focus: number, breakTime: number) => void;
}

export const PomodoroSettings = ({
  isPomodoroMode,
  focusDuration,
  breakDuration,
  onTogglePomodoro,
  onUpdateSettings,
}: PomodoroSettingsProps) => {
  const [localFocus, setLocalFocus] = useState(focusDuration.toString());
  const [localBreak, setLocalBreak] = useState(breakDuration.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const focus = parseInt(localFocus);
    const breakTime = parseInt(localBreak);
    if (focus > 0 && breakTime > 0) {
      onUpdateSettings(focus, breakTime);
      setIsEditing(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <CardTitle>Pomodoro Mode</CardTitle>
          </div>
          <Switch
            checked={isPomodoroMode}
            onCheckedChange={onTogglePomodoro}
          />
        </div>
        <CardDescription>
          Alternates between focus and break sessions with audio alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isPomodoroMode && (
          <>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
                  <Input
                    id="focusDuration"
                    type="number"
                    min="1"
                    value={localFocus}
                    onChange={(e) => setLocalFocus(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    min="1"
                    value={localBreak}
                    onChange={(e) => setLocalBreak(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" className="flex-1 bg-gradient-primary">
                    Save
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Focus Time</span>
                  <span className="font-semibold text-primary">{focusDuration} min</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Break Time</span>
                  <span className="font-semibold text-accent">{breakDuration} min</span>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Customize
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

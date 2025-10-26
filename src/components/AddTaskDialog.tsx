import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";

interface AddTaskDialogProps {
  onAddTask: (name: string, duration: number, isPomodoroMode: boolean, focusDuration?: number, breakDuration?: number) => void;
  defaultPomodoro: boolean;
  defaultFocusDuration: number;
  defaultBreakDuration: number;
}

export const AddTaskDialog = ({ onAddTask, defaultPomodoro, defaultFocusDuration, defaultBreakDuration }: AddTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [duration, setDuration] = useState("");
  const [usePomodoro, setUsePomodoro] = useState(defaultPomodoro);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim() && duration) {
      onAddTask(
        taskName.trim(), 
        parseInt(duration),
        usePomodoro,
        usePomodoro ? defaultFocusDuration : undefined,
        usePomodoro ? defaultBreakDuration : undefined
      );
      setTaskName("");
      setDuration("");
      setUsePomodoro(defaultPomodoro);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow-primary">
          <Plus className="mr-2 h-5 w-5" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taskName">Task Name</Label>
            <Input
              id="taskName"
              placeholder="e.g., Study Mathematics"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="e.g., 60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="pomodoro-mode">Pomodoro Mode</Label>
              <div className="text-xs text-muted-foreground">
                Use focus/break cycles
              </div>
            </div>
            <Switch
              id="pomodoro-mode"
              checked={usePomodoro}
              onCheckedChange={setUsePomodoro}
            />
          </div>
          <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90">
            Create Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

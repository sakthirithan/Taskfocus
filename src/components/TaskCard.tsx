import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Trash2, CheckCircle2, RotateCcw, Coffee, Brain } from "lucide-react";
import { Task } from "@/types/task";
import { audioAlert } from "@/utils/audioAlerts";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: Task;
  onToggleTimer: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onResetTask: (taskId: string) => void;
  onTimeUpdate: (taskId: string, seconds: number) => void;
  onPomodoroBreakEnd: (taskId: string) => void;
}

export const TaskCard = ({
  task,
  onToggleTimer,
  onDeleteTask,
  onCompleteTask,
  onResetTask,
  onTimeUpdate,
  onPomodoroBreakEnd,
}: TaskCardProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const lastNotifiedRef = useRef<string>("");

  useEffect(() => {
    if (task.isRunning && !task.completed) {
      intervalRef.current = setInterval(() => {
        const newTime = task.timeSpent + 1;
        onTimeUpdate(task.id, newTime);
        
        // Pomodoro mode logic
        if (task.isPomodoroMode && task.pomodoroSettings) {
          const { focusDuration, breakDuration, isOnBreak } = task.pomodoroSettings;
          const cycleDuration = isOnBreak ? breakDuration * 60 : focusDuration * 60;
          const cycleTime = newTime % (focusDuration * 60 + breakDuration * 60);
          
          // Check if we need to switch between focus and break
          if (isOnBreak) {
            // Currently on break, check if break is over
            if (cycleTime === 0 || cycleTime >= (focusDuration * 60 + breakDuration * 60)) {
              audioAlert.playFocusAlert();
              const notifId = `focus-${task.id}-${Date.now()}`;
              if (lastNotifiedRef.current !== notifId) {
                lastNotifiedRef.current = notifId;
                toast({
                  title: "🧠 Focus Time!",
                  description: `Back to work on "${task.name}"`,
                });
              }
              onPomodoroBreakEnd(task.id);
            }
          } else {
            // Currently focusing, check if focus session is over
            if (cycleTime === focusDuration * 60) {
              audioAlert.playBreakAlert();
              const notifId = `break-${task.id}-${Date.now()}`;
              if (lastNotifiedRef.current !== notifId) {
                lastNotifiedRef.current = notifId;
                toast({
                  title: "☕ Break Time!",
                  description: `Take a ${breakDuration} minute break`,
                });
              }
              onPomodoroBreakEnd(task.id);
            }
          }
        } else {
          // Regular mode - auto-complete when time is reached
          if (newTime >= task.duration * 60) {
            audioAlert.playCompleteAlert();
            onToggleTimer(task.id);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [task, onTimeUpdate, onToggleTimer, onPomodoroBreakEnd, toast]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgress = () => {
    if (task.isPomodoroMode && task.pomodoroSettings) {
      const { focusDuration, breakDuration, isOnBreak } = task.pomodoroSettings;
      const totalCycleDuration = (focusDuration + breakDuration) * 60;
      const cycleTime = task.timeSpent % totalCycleDuration;
      
      if (isOnBreak) {
        const breakStartTime = focusDuration * 60;
        const breakProgress = ((cycleTime - breakStartTime) / (breakDuration * 60)) * 100;
        return Math.min(Math.max(breakProgress, 0), 100);
      } else {
        return Math.min((cycleTime / (focusDuration * 60)) * 100, 100);
      }
    } else {
      return Math.min((task.timeSpent / (task.duration * 60)) * 100, 100);
    }
  };

  const getCurrentPhaseTime = () => {
    if (task.isPomodoroMode && task.pomodoroSettings) {
      const { focusDuration, breakDuration, isOnBreak } = task.pomodoroSettings;
      const totalCycleDuration = (focusDuration + breakDuration) * 60;
      const cycleTime = task.timeSpent % totalCycleDuration;
      
      if (isOnBreak) {
        const breakStartTime = focusDuration * 60;
        return cycleTime - breakStartTime;
      } else {
        return cycleTime;
      }
    }
    return task.timeSpent;
  };

  const getCurrentPhaseDuration = () => {
    if (task.isPomodoroMode && task.pomodoroSettings) {
      const { focusDuration, breakDuration, isOnBreak } = task.pomodoroSettings;
      return isOnBreak ? breakDuration * 60 : focusDuration * 60;
    }
    return task.duration * 60;
  };

  const progress = getProgress();
  const isComplete = !task.isPomodoroMode && task.timeSpent >= task.duration * 60;
  const isOnBreak = task.isPomodoroMode && task.pomodoroSettings?.isOnBreak;

  return (
    <Card
      className={`border-2 transition-all duration-300 ${
        task.completed
          ? 'border-green-500/50 bg-green-50 dark:bg-green-950/20'
          : task.isRunning
          ? isOnBreak
            ? 'border-accent animate-glow-pulse bg-gradient-card'
            : 'border-primary animate-glow-pulse bg-gradient-card'
          : 'border-border hover:border-primary/50'
      }`}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-xl ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.name}
                </h3>
                {task.isPomodoroMode && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    Pomodoro
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {task.isPomodoroMode && task.pomodoroSettings ? (
                  <span>
                    {task.pomodoroSettings.cyclesCompleted} cycles • 
                    {task.pomodoroSettings.focusDuration}m focus / {task.pomodoroSettings.breakDuration}m break
                  </span>
                ) : (
                  <span>Goal: {formatDuration(task.duration)}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!task.completed && !task.isPomodoroMode && task.timeSpent >= task.duration * 60 && (
                <Button
                  onClick={() => onCompleteTask(task.id)}
                  size="icon"
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              )}
              {task.timeSpent > 0 && !task.isRunning && (
                <Button
                  onClick={() => onResetTask(task.id)}
                  size="icon"
                  variant="outline"
                  className="hover:bg-accent"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={() => onDeleteTask(task.id)}
                size="icon"
                variant="outline"
                className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Timer Display */}
          {!task.completed && (
            <div className={`rounded-xl p-4 space-y-3 ${
              isOnBreak ? 'bg-accent/10' : 'bg-secondary/30'
            }`}>
              {isOnBreak && (
                <div className="flex items-center justify-center gap-2 text-accent font-medium">
                  <Coffee className="h-5 w-5" />
                  <span>Break Time</span>
                </div>
              )}
              {!isOnBreak && task.isRunning && (
                <div className="flex items-center justify-center gap-2 text-primary font-medium">
                  <Brain className="h-5 w-5" />
                  <span>Focus Time</span>
                </div>
              )}
              
              <div className="text-center">
                <div className={`text-3xl font-bold tabular-nums transition-opacity duration-500 ${
                  task.isRunning ? (isOnBreak ? 'text-accent animate-pulse-glow' : 'bg-gradient-primary bg-clip-text text-transparent animate-pulse-glow') : 'text-foreground'
                }`}>
                  {formatTime(getCurrentPhaseTime())}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  / {formatTime(getCurrentPhaseDuration())}
                </div>
                {task.isPomodoroMode && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Total: {formatTime(task.timeSpent)}
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{isOnBreak ? 'Break Progress' : 'Focus Progress'}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isComplete ? 'bg-green-500' : isOnBreak ? 'bg-accent' : 'bg-gradient-primary'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Timer Control */}
              <Button
                onClick={() => onToggleTimer(task.id)}
                className={`w-full ${
                  task.isRunning 
                    ? 'bg-secondary hover:bg-secondary/80 text-secondary-foreground' 
                    : isOnBreak
                    ? 'bg-accent hover:opacity-90'
                    : 'bg-gradient-primary hover:opacity-90 shadow-glow-primary'
                }`}
              >
                {task.isRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    {task.timeSpent > 0 ? 'Resume Timer' : 'Start Timer'}
                  </>
                )}
              </Button>

              {isComplete && !task.completed && (
                <div className="text-center text-sm font-medium text-green-600 dark:text-green-400 animate-slide-up">
                  🎉 Goal reached! Mark as complete?
                </div>
              )}
            </div>
          )}

          {/* Completed Badge */}
          {task.completed && (
            <div className="bg-green-100 dark:bg-green-950/30 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-medium">
                <CheckCircle2 className="h-5 w-5" />
                Task Completed!
              </div>
              <div className="text-sm text-green-600 dark:text-green-500 mt-1">
                Total time: {formatTime(task.timeSpent)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

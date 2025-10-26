import { useState, useEffect } from "react";
import { AddTaskDialog } from "@/components/AddTaskDialog";
import { TaskCard } from "@/components/TaskCard";
import { DailyGoalCard } from "@/components/DailyGoalCard";
import { StatsCard } from "@/components/StatsCard";
import { PomodoroSettings } from "@/components/PomodoroSettings";
import { Task } from "@/types/task";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(240); // 4 hours default
  const [pomodoroEnabled, setPomodoroEnabled] = useState(false);
  const [pomodoroFocusDuration, setPomodoroFocusDuration] = useState(25);
  const [pomodoroBreakDuration, setPomodoroBreakDuration] = useState(5);
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("focusFlowTasks");
    const savedGoal = localStorage.getItem("focusFlowDailyGoal");
    const savedPomodoroEnabled = localStorage.getItem("focusFlowPomodoroEnabled");
    const savedPomodoroFocus = localStorage.getItem("focusFlowPomodoroFocus");
    const savedPomodoroBreak = localStorage.getItem("focusFlowPomodoroBreak");
    
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      setTasks(parsedTasks.map((t: Task) => ({ 
        ...t, 
        createdAt: new Date(t.createdAt),
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        isRunning: false // Reset all timers on load
      })));
    }
    if (savedGoal) {
      setDailyGoalMinutes(parseInt(savedGoal));
    }
    if (savedPomodoroEnabled) {
      setPomodoroEnabled(savedPomodoroEnabled === "true");
    }
    if (savedPomodoroFocus) {
      setPomodoroFocusDuration(parseInt(savedPomodoroFocus));
    }
    if (savedPomodoroBreak) {
      setPomodoroBreakDuration(parseInt(savedPomodoroBreak));
    }
  }, []);

  // Save to localStorage when tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("focusFlowTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const totalTimeToday = tasks.reduce((sum, task) => sum + task.timeSpent, 0);

  const handleAddTask = (
    name: string, 
    duration: number, 
    isPomodoroMode: boolean,
    focusDuration?: number,
    breakDuration?: number
  ) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name,
      duration,
      timeSpent: 0,
      completed: false,
      isRunning: false,
      isPomodoroMode,
      pomodoroSettings: isPomodoroMode ? {
        focusDuration: focusDuration || pomodoroFocusDuration,
        breakDuration: breakDuration || pomodoroBreakDuration,
        cyclesCompleted: 0,
        isOnBreak: false,
      } : undefined,
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
    toast({
      title: "Task created!",
      description: `"${name}" added to your focus list${isPomodoroMode ? ' with Pomodoro mode' : ''}.`,
    });
  };

  const handleToggleTimer = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, isRunning: !t.isRunning } : t
    ));
    
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.isRunning) {
      toast({
        title: "Timer started",
        description: `Focus session started for "${task.name}"`,
      });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
    toast({
      title: "Task deleted",
      description: `"${task?.name}" removed from your list.`,
    });
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: true, isRunning: false, completedAt: new Date() } : t
    ));
    
    const task = tasks.find(t => t.id === taskId);
    toast({
      title: "🎉 Task completed!",
      description: `Awesome work on "${task?.name}"!`,
    });
  };

  const handleResetTask = (taskId: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { 
        ...t, 
        timeSpent: 0, 
        isRunning: false,
        pomodoroSettings: t.pomodoroSettings ? {
          ...t.pomodoroSettings,
          cyclesCompleted: 0,
          isOnBreak: false,
        } : undefined
      } : t
    ));
    
    const task = tasks.find(t => t.id === taskId);
    toast({
      title: "Timer reset",
      description: `"${task?.name}" timer has been reset.`,
    });
  };

  const handleTimeUpdate = (taskId: string, seconds: number) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, timeSpent: seconds } : t
    ));
  };

  const handlePomodoroBreakEnd = (taskId: string) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId && t.pomodoroSettings) {
        const newIsOnBreak = !t.pomodoroSettings.isOnBreak;
        const newCyclesCompleted = newIsOnBreak 
          ? t.pomodoroSettings.cyclesCompleted 
          : t.pomodoroSettings.cyclesCompleted + 1;
        
        return {
          ...t,
          pomodoroSettings: {
            ...t.pomodoroSettings,
            isOnBreak: newIsOnBreak,
            cyclesCompleted: newCyclesCompleted,
          }
        };
      }
      return t;
    }));
  };

  const handleUpdateGoal = (minutes: number) => {
    setDailyGoalMinutes(minutes);
    localStorage.setItem("focusFlowDailyGoal", minutes.toString());
    toast({
      title: "Goal updated!",
      description: `New daily goal: ${minutes / 60} hours`,
    });
  };

  const handleTogglePomodoro = (enabled: boolean) => {
    setPomodoroEnabled(enabled);
    localStorage.setItem("focusFlowPomodoroEnabled", enabled.toString());
    toast({
      title: enabled ? "Pomodoro enabled" : "Pomodoro disabled",
      description: enabled 
        ? "New tasks will use Pomodoro mode by default" 
        : "New tasks will use regular timer mode",
    });
  };

  const handleUpdatePomodoroSettings = (focus: number, breakTime: number) => {
    setPomodoroFocusDuration(focus);
    setPomodoroBreakDuration(breakTime);
    localStorage.setItem("focusFlowPomodoroFocus", focus.toString());
    localStorage.setItem("focusFlowPomodoroBreak", breakTime.toString());
    toast({
      title: "Pomodoro settings updated",
      description: `${focus}min focus / ${breakTime}min break`,
    });
  };

  const runningTasksCount = tasks.filter(t => t.isRunning).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-white py-8 px-4 shadow-glow-primary">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold">Focus Flow</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-white/90 text-lg">Boost Your Productivity</p>
            {runningTasksCount > 0 && (
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                <span className="animate-pulse-glow inline-block">
                  {runningTasksCount} timer{runningTasksCount > 1 ? 's' : ''} running
                </span>
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Daily Goal */}
          <div className="lg:col-span-1 space-y-6">
            <DailyGoalCard
              dailyGoalMinutes={dailyGoalMinutes}
              totalTimeToday={totalTimeToday}
              onUpdateGoal={handleUpdateGoal}
            />
            
            <PomodoroSettings
              isPomodoroMode={pomodoroEnabled}
              focusDuration={pomodoroFocusDuration}
              breakDuration={pomodoroBreakDuration}
              onTogglePomodoro={handleTogglePomodoro}
              onUpdateSettings={handleUpdatePomodoroSettings}
            />
            
            <StatsCard tasks={tasks} totalTimeToday={totalTimeToday} />
          </div>

          {/* Right Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-foreground">Your Tasks</h2>
                <AddTaskDialog 
                  onAddTask={handleAddTask}
                  defaultPomodoro={pomodoroEnabled}
                  defaultFocusDuration={pomodoroFocusDuration}
                  defaultBreakDuration={pomodoroBreakDuration}
                />
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-12 bg-gradient-card rounded-2xl border border-border">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">No tasks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first task to start your focus journey
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleTimer={handleToggleTimer}
                      onDeleteTask={handleDeleteTask}
                      onCompleteTask={handleCompleteTask}
                      onResetTask={handleResetTask}
                      onTimeUpdate={handleTimeUpdate}
                      onPomodoroBreakEnd={handlePomodoroBreakEnd}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;

export interface Task {
  id: string;
  name: string;
  duration: number; // in minutes
  timeSpent: number; // in seconds
  completed: boolean;
  isRunning: boolean;
  isPomodoroMode: boolean;
  pomodoroSettings?: {
    focusDuration: number; // in minutes
    breakDuration: number; // in minutes
    cyclesCompleted: number;
    isOnBreak: boolean;
  };
  createdAt: Date;
  completedAt?: Date;
}

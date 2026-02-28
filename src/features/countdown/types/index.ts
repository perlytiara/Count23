export interface CountdownSession {
  id: string;
  targetTime: string;
  createdAt: string;
  totalDuration: number;
  label?: string;
  status: "active" | "completed" | "cancelled";
}

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  totalRemaining: number;
  progress: number;
  isComplete: boolean;
}

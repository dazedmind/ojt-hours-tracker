export interface TimeEntry {
  id: number;
  date: string;
  time_in: string;
  time_out: string;
  break_time: string;
}

export type NewTimeEntry = Omit<TimeEntry, "id">;

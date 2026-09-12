export type TaskType = "Discussion" | "Paper" | "Project" | "Exam";

export interface StudentTask {
  id: number;
  course: string;
  courseCode: string;
  type: TaskType;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
}

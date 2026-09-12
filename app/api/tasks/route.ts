import { NextRequest, NextResponse } from "next/server";
import type { StudentTask } from "../../types";

let tasks: StudentTask[] = [
  { id: 1, course: "Digital Culture", courseCode: "ART 218", type: "Discussion", title: "Week 8 discussion response", description: "Share a 250-word response and reply to two classmates.", dueDate: "2026-09-12T18:00:00.000Z", completed: false },
  { id: 2, course: "Modern Literature", courseCode: "LIT 304", type: "Paper", title: "The modernist city", description: "Final revision of the comparative analysis essay.", dueDate: "2026-09-13T23:59:00.000Z", completed: false },
  { id: 3, course: "Human Computer Interaction", courseCode: "CS 256", type: "Project", title: "Prototype usability report", description: "Synthesize testing notes and add recommendations.", dueDate: "2026-09-15T17:00:00.000Z", completed: false },
  { id: 4, course: "Cognitive Psychology", courseCode: "PSY 201", type: "Exam", title: "Memory & cognition exam", description: "Review modules 5–8 and complete practice questions.", dueDate: "2026-09-18T14:00:00.000Z", completed: false },
  { id: 5, course: "Digital Culture", courseCode: "ART 218", type: "Project", title: "Visual archive moodboard", description: "Collect and annotate ten reference artifacts.", dueDate: "2026-09-20T20:00:00.000Z", completed: true },
  { id: 6, course: "Modern Literature", courseCode: "LIT 304", type: "Discussion", title: "Reading notes: Woolf", description: "Post three observations from the assigned reading.", dueDate: "2026-09-22T18:00:00.000Z", completed: false },
];

export async function GET() {
  return NextResponse.json(tasks);
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as { id?: number; completed?: boolean };
  const task = tasks.find((item) => item.id === body.id);

  if (!task || typeof body.completed !== "boolean") {
    return NextResponse.json({ message: "Task or completion state is invalid." }, { status: 400 });
  }

  task.completed = body.completed;
  return NextResponse.json(task);
}

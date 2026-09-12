"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Check, CheckCircle2, FileText, GraduationCap, LoaderCircle, MessageCircle, RefreshCw, Sparkles, Target, X } from "lucide-react";
import type { StudentTask, TaskType } from "./types";

const filters = ["All", "Discussion", "Paper", "Project", "Exam"] as const;
type Filter = (typeof filters)[number];

const typeIcons = { Discussion: MessageCircle, Paper: FileText, Project: Sparkles, Exam: GraduationCap };

function dueLabel(date: string) {
  const due = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const difference = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);
  const time = due.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (difference === 0) return `Today · ${time}`;
  if (difference === 1) return `Tomorrow · ${time}`;
  return due.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }) + ` · ${time}`;
}

function FocusMode({ task, onClose, onComplete }: { task: StudentTask; onClose: () => void; onComplete: (task: StudentTask) => void }) {
  return (
    <div className="focus-backdrop" role="dialog" aria-modal="true" aria-labelledby="focus-title" onMouseDown={onClose}>
      <section className="focus-panel" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button close" onClick={onClose} aria-label="Close focus mode"><X size={22} /></button>
        <div className="focus-orbit"><Target size={30} /></div>
        <p className="eyebrow">Your next move</p>
        <h2 id="focus-title">{task.title}</h2>
        <p className="focus-course">{task.courseCode} · {task.course}</p>
        <p className="focus-description">{task.description}</p>
        <div className="focus-due"><span>Due</span><strong>{dueLabel(task.dueDate)}</strong></div>
        <button className="complete-focus" onClick={() => onComplete(task)}><CheckCircle2 size={22} /> Mark as done</button>
      </section>
    </div>
  );
}

export default function Home() {
  const [tasks, setTasks] = useState<StudentTask[]>([]);
  const [filter, setFilter] = useState<Filter>("All");
  const [focusTask, setFocusTask] = useState<StudentTask | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load tasks");
      setTasks(await response.json());
    } catch {
      setError("We couldn’t sync your tasks. Try refreshing.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { void fetchTasks(); }, [fetchTasks]);

  const toggleTask = async (task: StudentTask) => {
    const completed = !task.completed;
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed } : item));
    if (completed) setFocusTask(null);
    try {
      const response = await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: task.id, completed }) });
      if (!response.ok) throw new Error("Update failed");
    } catch {
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: task.completed } : item));
      setError("That change didn’t save. Your task was restored.");
    }
  };

  const openTasks = tasks.filter((task) => !task.completed);
  const visibleTasks = useMemo(() => tasks.filter((task) => filter === "All" || task.type === filter), [tasks, filter]);
  const urgentTask = [...openTasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#"><span className="brand-mark"><BookOpen size={21} /></span><span>scholar</span></a>
        <div className="header-actions">
          <span className="task-count"><strong>{openTasks.length}</strong> tasks left</span>
          <button className="refresh-button" onClick={() => void fetchTasks()} disabled={isRefreshing} aria-label="Refresh tasks">
            <RefreshCw size={18} className={isRefreshing ? "spin" : ""} /><span>Refresh</span>
          </button>
          <button className="focus-button" disabled={!urgentTask} onClick={() => setFocusTask(urgentTask)}><Target size={19} /><span>Focus Most Urgent</span></button>
        </div>
      </header>

      <div className="dashboard">
        <section className="hero">
          <div><p className="eyebrow">Saturday, September 12</p><h1>Make space for<br /><em>what matters.</em></h1></div>
          <p className="hero-copy">A clear view of what’s ahead. Choose one thing, give it your attention, then move forward.</p>
        </section>

        <nav className="filters" aria-label="Filter tasks">
          {filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}<span>{item === "All" ? tasks.length : tasks.filter((task) => task.type === item).length}</span></button>)}
        </nav>

        {error && <div className="error" role="status">{error}<button onClick={() => setError(null)} aria-label="Dismiss"><X size={17} /></button></div>}

        {isRefreshing && tasks.length === 0 ? (
          <div className="loading"><LoaderCircle className="spin" /><span>Gathering your tasks…</span></div>
        ) : visibleTasks.length === 0 ? (
          <div className="empty"><CheckCircle2 size={34} /><h2>Nothing here right now.</h2><p>Try another filter or enjoy the breathing room.</p></div>
        ) : (
          <section className="task-grid" aria-label="Task list">
            {visibleTasks.map((task, index) => {
              const Icon = typeIcons[task.type as TaskType];
              return (
                <article className={`task-card type-${task.type.toLowerCase()} ${task.completed ? "completed" : ""}`} key={task.id}>
                  <div className="card-top"><span className="course"><i />{task.courseCode}</span><span className="number">{String(index + 1).padStart(2, "0")}</span></div>
                  <div className="type"><Icon size={16} /><span>{task.type}</span></div>
                  <h2>{task.title}</h2>
                  <p className="description">{task.description}</p>
                  <div className="card-bottom">
                    <div className="due"><span>Due</span><strong>{dueLabel(task.dueDate)}</strong></div>
                    <button className="done-button" onClick={() => void toggleTask(task)} aria-label={`${task.completed ? "Mark incomplete" : "Mark done"}: ${task.title}`}>
                      <span className="check"><Check size={18} /></span><span>{task.completed ? "Done" : "Mark done"}</span><ArrowRight className="arrow" size={17} />
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
      <footer><span>Scholar</span><p>Small steps, meaningful progress.</p><span>{new Date().getFullYear()}</span></footer>
      {focusTask && <FocusMode task={focusTask} onClose={() => setFocusTask(null)} onComplete={(task) => void toggleTask(task)} />}
    </main>
  );
}

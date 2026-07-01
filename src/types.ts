export interface User {
  id: string;
  name: string;
  avatar: string;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number; // Percentage 0-100
}

export interface Comment {
  id: string;
  authorId: string;
  message: string;
  timestamp: string;
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeId: string;
  labels: string[];
  comments: Comment[];
}

export interface AppState {
  currentUser: User;
  teamMembers: User[];
  projects: Project[];
  tasks: Task[];
  isCompact: boolean;
  isDarkMode: boolean;
  notificationsEnabled: boolean;
}

export enum UserRole {
  FREE = 'FREE',
  PRO = 'PRO'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  learningLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  streak: number;
  avatar?: string;
}

export interface NotebookEntry {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  lastModified: Date;
}

export interface CodeSession {
  id: string;
  language: 'python' | 'javascript' | 'typescript';
  code: string;
  output?: string;
  analysis?: string;
}

export interface AnalyticsMetric {
  label: string;
  value: number;
  trend: number; // Percentage change
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
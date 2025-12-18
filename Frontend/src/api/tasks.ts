// src/api/tasks.ts (backend-powered)
export type Task = {
  id: string;
  title: string;
  description?: string;
  budget?: number;
  requester?: string;
  createdAt: string | number;
  status: "open" | "assigned" | "completed";
  confirmationCode?: string;
  confirmationLink?: string;
};

import { API_BASE as ROOT_API } from '../lib/config';
const API_BASE = `${ROOT_API}/tasks`;

type ListParams = { status?: 'open'|'assigned'|'completed'; type?: 'service'|'delivery'; mine?: boolean; limit?: number };

export async function listTasks(token: string, params: ListParams = {}): Promise<Task[]> {
  const q = new URLSearchParams();
  if (params.limit) q.set('limit', String(params.limit));
  if (params.status) q.set('status', params.status);
  if (params.type) q.set('type', params.type);
  if (params.mine) q.set('assignee', 'me');
  const qs = q.toString();
  const url = qs ? `${API_BASE}?${qs}` : API_BASE;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return (data.items || []) as Task[];
}

export type NewTaskInput = { title: string; description?: string; budget?: number; requester?: string; type?: 'delivery' | 'service' };

export async function createTask(token: string, input: NewTaskInput): Promise<Task> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(input)
  });
  if (!res.ok) throw new Error('Failed to create task');
  return res.json();
}

export async function updateTaskStatus(token: string, id: string, status: Task['status']): Promise<Task> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

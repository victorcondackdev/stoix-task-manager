import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export type Task = {
  id: number;
  title: string;
  description?: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = { items: T[]; page: number; pageSize: number; total: number };

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  async initCsrf(): Promise<void> {
    await firstValueFrom(this.http.get('/api/csrf', { withCredentials: true }));
  }

  listTasks(params: { page?: number; pageSize?: number; search?: string; status?: string } = {}) {
    return this.http.get<Paginated<Task>>(`/api/tasks`, { params, withCredentials: true });
  }

  createTask(data: Partial<Task>) {
    return this.http.post<Task>(`/api/tasks`, data, { withCredentials: true });
  }

  updateTask(id: number, data: Partial<Task>) {
    return this.http.put<Task>(`/api/tasks/${id}`, data, { withCredentials: true });
  }

  deleteTask(id: number) {
    return this.http.delete<void>(`/api/tasks/${id}`, { withCredentials: true });
  }
}

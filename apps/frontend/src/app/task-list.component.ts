import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Task } from './api.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="max-w-5xl mx-auto px-4 py-6 space-y-4">
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <h1 class="text-xl font-semibold">Stoix – Tasks</h1>
      <div class="flex items-center gap-2">
        <input [(ngModel)]="search" placeholder="Buscar pelo título..." (ngModelChange)="reload()" class="min-w-[200px]" />
        <select [(ngModel)]="status" (change)="reload()">
          <option value="">Status: Todos</option>
          <option value="TODO">A Fazer</option>
          <option value="IN_PROGRESS">Em Progresso</option>
          <option value="DONE">Concluída</option>
        </select>
      </div>
    </header>

    <section class="card">
      <h2 class="text-lg font-medium mb-3">{{ editingId ? 'Editar tarefa' : 'Nova tarefa' }}</h2>
      <form (ngSubmit)="save()" #f="ngForm" class="grid md:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-sm text-muted">Título</label>
          <input name="title" required [(ngModel)]="form.title" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm text-muted">Status</label>
          <select name="status" [(ngModel)]="form.status">
            <option value="TODO">A Fazer</option>
            <option value="IN_PROGRESS">Em Progresso</option>
            <option value="DONE">Concluída</option>
          </select>
        </div>
        <div class="flex flex-col gap-1 md:col-span-2">
          <label class="text-sm text-muted">Descrição</label>
          <textarea name="description" rows="3" [(ngModel)]="form.description"></textarea>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm text-muted">Prazo</label>
          <input type="date" name="dueDate" [(ngModel)]="form.dueDate" />
        </div>
        <div class="flex items-center gap-2 md:col-span-2">
          <button type="submit" class="btn-primary">{{ editingId ? 'Atualizar' : 'Criar' }}</button>
          <button type="button" class="btn-danger" (click)="resetForm()" *ngIf="editingId">Cancelar</button>
        </div>
      </form>
    </section>

    <section class="card overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th class="w-14">ID</th>
            <th>Título</th>
            <th class="w-40">Status</th>
            <th class="w-40">Prazo</th>
            <th class="w-44">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of tasks()">
            <td>{{ t.id }}</td>
            <td class="pr-2">{{ t.title }}</td>
            <td>
              <span class="pill"
                    [ngClass]="{
                      'pill-todo': t.status==='TODO',
                      'pill-progress': t.status==='IN_PROGRESS',
                      'pill-done': t.status==='DONE'
                    }">
                {{ labelStatus(t.status) }}
              </span>
            </td>
            <td>{{ t.dueDate ? (t.dueDate | date:'yyyy-MM-dd') : '-' }}</td>
            <td class="space-x-2">
              <button (click)="edit(t)" class="btn-primary">Editar</button>
              <button class="btn-danger" (click)="remove(t)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex justify-center items-center gap-3 pt-3">
        <button (click)="prev()" [disabled]="page===1">Anterior</button>
        <span>Página {{page}} de {{totalPages()}}</span>
        <button (click)="next()" [disabled]="page>=totalPages()">Próxima</button>
      </div>
    </section>
  </div>
  `
})
export class TaskListComponent implements OnInit {
  private api = inject(ApiService);

  tasks = signal<Task[]>([]);
  total = signal(0);

  page = 1;
  pageSize = 10;
  search = '';
  status = '';

  editingId: number | null = null;
  form: any = { title: '', description: '', status: 'TODO', dueDate: '' };

  totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));

  async ngOnInit() {
    await this.api.initCsrf();
    this.reload();
  }

  labelStatus(s: Task['status']) {
    return s === 'TODO' ? 'A Fazer' : s === 'IN_PROGRESS' ? 'Em Progresso' : 'Concluída';
  }

  reload() {
    this.api.listTasks({ page: this.page, pageSize: this.pageSize, search: this.search, status: this.status })
      .subscribe(r => { this.tasks.set(r.items); this.total.set(r.total); });
  }

  edit(t: Task) {
    this.editingId = t.id;
    this.form = {
      title: t.title,
      description: t.description ?? '',
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.substring(0,10) : ''
    };
  }

  resetForm() {
    this.editingId = null;
    this.form = { title: '', description: '', status: 'TODO', dueDate: '' };
  }

  save() {
    const payload: any = {
      title: this.form.title,
      description: this.form.description || null,
      status: this.form.status,
      dueDate: this.form.dueDate ? new Date(this.form.dueDate).toISOString() : null
    };

    if (this.editingId) {
      this.api.updateTask(this.editingId, payload).subscribe(() => { this.resetForm(); this.reload(); });
    } else {
      this.api.createTask(payload).subscribe(() => { this.resetForm(); this.reload(); });
    }
  }

  remove(t: Task) {
    if (confirm(`Excluir tarefa #${t.id}?`)) {
      this.api.deleteTask(t.id).subscribe(() => this.reload());
    }
  }

  prev() { if (this.page > 1) { this.page--; this.reload(); } }
  next() { if (this.page < this.totalPages()) { this.page++; this.reload(); } }
}

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { TaskListComponent } from './app/task-list.component';

bootstrapApplication(TaskListComponent, appConfig).catch(err => console.error(err));

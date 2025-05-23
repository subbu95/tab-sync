import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from './state/app.state';
import { selectUserRole } from './state/role.selectors';
import { RoleSyncService } from './role-sync.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1>Current Role: {{ role() }}</h1>
      <button (click)="setAdmin()">Set Role to Administrator</button>
      <button (click)="setGuest()">Set Role to Guest</button>
    </div>
  `
})
export class AppComponent {
  private store = inject(Store<AppState>);
  private roleSync = inject(RoleSyncService);
  role = toSignal(this.store.select(selectUserRole), { initialValue: 'Guest' });

  setAdmin() {
    this.roleSync.setRole('Administrator');
  }

  setGuest() {
    this.roleSync.setRole('Guest');
  }
}

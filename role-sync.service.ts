import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { setRole } from './state/role.actions';
import { AppState } from './state/app.state';

@Injectable({ providedIn: 'root' })
export class RoleSyncService {
  private broadcast = new BroadcastChannel('role_channel');

  constructor(private store: Store<AppState>) {
    this.broadcast.onmessage = (event) => {
      if (event.data?.type === 'roleChange') {
        this.store.dispatch(setRole({ role: event.data.role }));
        this.saveToIndexedDB(event.data.role);
      }
    };

    this.loadFromIndexedDB().then(role => {
      if (role) this.store.dispatch(setRole({ role }));
    });
  }

  setRole(role: string) {
    this.broadcast.postMessage({ type: 'roleChange', role });
    this.store.dispatch(setRole({ role }));
    this.saveToIndexedDB(role);
  }

  private async saveToIndexedDB(role: string) {
    const { openDB } = await import('idb');
    const db = await openDB('AppDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
      }
    });
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put(role, 'userRole');
    await tx.done;
  }

  private async loadFromIndexedDB(): Promise<string | null> {
    const { openDB } = await import('idb');
    const db = await openDB('AppDB', 1);
    const tx = db.transaction('settings', 'readonly');
    const role = await tx.objectStore('settings').get('userRole');
    return role || null;
  }
}

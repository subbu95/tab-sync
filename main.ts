import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideStore } from '@ngrx/store';
import { roleReducer } from './app/state/role.reducer';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({ role: roleReducer })
  ]
}).catch(err => console.error(err));

import { createReducer, on } from '@ngrx/store';
import { setRole } from './role.actions';

export interface RoleState {
  role: string;
}

export const initialState: RoleState = {
  role: 'Guest',
};

export const roleReducer = createReducer(
  initialState,
  on(setRole, (state, { role }) => ({ ...state, role }))
);

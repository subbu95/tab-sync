import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RoleState } from './role.reducer';

export const selectRoleState = createFeatureSelector<RoleState>('role');

export const selectUserRole = createSelector(
  selectRoleState,
  (state: RoleState) => state.role
);

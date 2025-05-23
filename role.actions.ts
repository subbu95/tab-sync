import { createAction, props } from '@ngrx/store';

export const setRole = createAction(
  '[Role] Set Role',
  props<{ role: string }>()
);

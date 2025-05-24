// shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GridComponent } from './components/grid/grid.component';
import { MaterialModule } from './material.module';

@NgModule({
  exports: [GridComponent],
  imports: [CommonModule, MaterialModule, GridComponent],
})
export class SharedModule {}

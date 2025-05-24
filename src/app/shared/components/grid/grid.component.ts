import { Component, Input, ViewChild, ViewChildren, QueryList, AfterViewInit, ChangeDetectorRef, signal } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'eclipse-grid',
  standalone: true,
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
})
export class GridComponent implements AfterViewInit {
  @Input() columns: string[] = [];  // Column names
  @Input() childColumns: string[] = [];
  @Input() showAction: boolean = false;
  @Input() enablePagination: boolean = true;
  @Input() enableSorting: boolean = true;

  // Fix: Create a computed column list to include "expand"
  displayedColumns = signal<string[]>(['expand']);
  // expandedRow: any = null; // Track the expanded row
  childData: { [key: string]: any[] } = {}; // Store child table data
  loadingChildData: { [key: number]: boolean } = {};

  @Input() set data(value: any[]) {
    if (value) {
      this.dataSource.set(new MatTableDataSource<any>(value));
      console.log(this.dataSource);
      // this.createChildDataSources(value);
      this.displayedColumns.set(['expand', ...this.columns]); // Fix: Expand columns in TypeScript
      this.cdr.detectChanges(); // Ensure UI updates
    }
  }

  dataSource = signal<MatTableDataSource<any>>(new MatTableDataSource<any>([]));
  childDataSources = new Map<any, MatTableDataSource<any>>(); // Stores child data sources
  expandedRow = signal<any | null>(null);
  childTableLimit = signal(5);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChildren(MatSort) childSorts!: QueryList<MatSort>; // Fix: Get all MatSort instances

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.dataSource().paginator = this.paginator;
    this.dataSource().sort = this.childSorts.first; // Set parent table sorting
    console.log(this.dataSource());
    this.cdr.detectChanges();
  }

  toggleRow(row: any) {
    if (!row.children || row.children.length === 0) return;
    this.expandedRow.set(this.expandedRow() === row ? null : row);
    this.cdr.detectChanges();
  }

  isRowExpanded(row: any): boolean {
    return this.expandedRow() === row;
  }

  createChildDataSources(data: any[]) {
    data.forEach(row => {
      if (row.children) {
        this.childDataSources.set(row, new MatTableDataSource<any>(row.children));
      }
    });
  }

  getChildDataSource(row: any): MatTableDataSource<any> {
    return this.childDataSources.get(row) || new MatTableDataSource<any>([]);
  }

  viewMore() {
    this.childTableLimit.set(this.childTableLimit() + 5);
    this.cdr.detectChanges();
  }

  keyMapping(columnName:string):string {
    if(columnName.split(" ").length > 1){
      columnName = columnName.replace(" ","_");
    }
    columnName = columnName.toLocaleLowerCase();
    return columnName;
  }
}

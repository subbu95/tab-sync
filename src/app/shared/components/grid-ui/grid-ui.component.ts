import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';

@Component({
  selector: 'eclipse-grid-ui',
  templateUrl: './grid-ui.component.html',
  styleUrls: ['./grid-ui.component.css'],
  standalone: true,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule],
})
export class GridUiComponent {

  @ViewChild('outerSort', { static: true }) sort!: MatSort;
  @ViewChildren('innerSort') innerSort!: QueryList<MatSort>;
  @ViewChildren('innerTables') innerTables!: QueryList<MatTable<Address>>;

  dataSource!: MatTableDataSource<User>;
  usersData: User[] = [];
  columnsToDisplay = ['name', 'email', 'phone'];
  innerDisplayedColumns = ['street', 'zipCode', 'city'];
  expandedElement!: User | null;

  constructor(
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    USERS.forEach(user => {
      if (user.addresses && Array.isArray(user.addresses) && user.addresses.length) {
        this.usersData = [...this.usersData, {...user, addresses: new MatTableDataSource(user.addresses)}];
      } else {
        this.usersData = [...this.usersData, user];
      }
    });
    this.dataSource = new MatTableDataSource(this.usersData);
    this.dataSource.sort = this.sort;
  }

  toggleRow(element: User) {
    element.addresses && (element.addresses as MatTableDataSource<Address>).data.length ? (this.expandedElement = this.expandedElement === element ? null : element) : null;
    this.cd.detectChanges();
    this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<Address>).sort = this.innerSort.toArray()[index]);
  }

  applyFilter(filterValue: string) {
    this.innerTables.forEach((table, index) => (table.dataSource as MatTableDataSource<Address>).filter = filterValue.trim().toLowerCase());
  }
}

export interface User {
  name: string;
  email: string;
  phone: string;
  addresses?: Address[] | MatTableDataSource<Address>;
}

export interface Address {
  street: string;
  zipCode: string;
  city: string;
}

export interface UserDataSource {
  name: string;
  email: string;
  phone: string;
  addresses?: MatTableDataSource<Address>;
}

const USERS: User[] = [
  {
    name: "Mason",
    email: "mason@test.com",
    phone: "9864785214",
    addresses: [
      {
        street: "Street 1",
        zipCode: "78542",
        city: "Kansas"
      },
      {
        street: "Street 2",
        zipCode: "78554",
        city: "Texas"
      }
    ]
  },
  {
    name: "Eugene",
    email: "eugene@test.com",
    phone: "8786541234",
  },
  {
    name: "Jason",
    email: "jason@test.com",
    phone: "7856452187",
    addresses: [
      {
        street: "Street 5",
        zipCode: "23547",
        city: "Utah"
      },
      {
        street: "Street 5",
        zipCode: "23547",
        city: "Ohio"
      }
    ]
  }
];


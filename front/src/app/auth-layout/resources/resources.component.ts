import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Resource } from 'src/app/interfaces/resource.interface';
import { ResourceAttributeService } from 'src/app/services/resource-attribute.service';
import { ResourceService } from 'src/app/services/resource.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { ResourceDialogComponent } from './resource-dialog/resource-dialog.component';
import { MatSort, Sort } from '@angular/material/sort';
import { FilterDropdownComponent } from '../filter-dropdown/filter-dropdown.component';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss']
})
export class ResourcesComponent implements OnInit {

  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['name', 'alias', 'microservice_name'];
  dataSource = new MatTableDataSource<Resource>();
  currentOpenedDropdown!: FilterDropdownComponent;
  filteredValues: any = { name: '', alias: '', microservice_name: '', useTopFilter: false };

  clickedRow: string = ''

  constructor(private resource: ResourceService,
    private matDialog: MatDialog,
    private _liveAnnouncer: LiveAnnouncer) {
  }

  ngOnInit(): void {
    this.resource.getResources().subscribe(data => {
      this.dataSource.data = data
      console.log('resources ', data);
    })
  }

  rowClicked(resource: Resource) {
    this.matDialog.open(ResourceDialogComponent, {
      data: resource
    }).afterClosed().subscribe(data => {
      const index = this.dataSource.data.findIndex(element => element.uid === data.uid);
      let dataSource = this.dataSource.data;
      dataSource[index].alias = data.alias;
      dataSource[index].description = data.description;
      this.dataSource.data = dataSource;
    })
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  resetFilters() {
    for (const key in this.filteredValues) {
      if (this.filteredValues.hasOwnProperty(key)) {
        this.filteredValues[key] = '';
      }
    }
    this.applyFilter();
  }

  applyFilter(filterValue: string = '', column: string = '', filterType: string = '') {
    if (column) {
      if (!filterType) {
        this.filteredValues[column] = '';
      } else {
        this.filteredValues[column] = filterValue;
        console.log(this.filteredValues)
      }
      this.filteredValues.useTopFilter = false;
    } else {
      this.filteredValues.useTopFilter = true;
      filterValue = filterValue.trim().toLowerCase();
      for (const key in this.filteredValues) {
        if (this.filteredValues.hasOwnProperty(key) && key !== 'useTopFilter') {
          this.filteredValues[key] = filterValue;
        }
      }
    }
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      let result = false;

      if (this.filteredValues.useTopFilter) {
        const dataStr = Object.keys(data).reduce((currentTerm, key) => {
          return currentTerm + (data as { [key: string]: any })[key] + '◬';
        }, '').toLowerCase();

        result = dataStr.indexOf(filterValue) !== -1;
      } else {
        result = true;
        for (const columnKey in this.filteredValues) {
          if (columnKey !== 'useTopFilter') {
            const filterColumnValue = this.filteredValues[columnKey];

            if (filterColumnValue) {
              const filterFunction = this.getFilterFunction(filterType);
              result = result && filterFunction(data[columnKey], filterColumnValue);
            }
          }
        }
      }

      return result;
    };

    this.dataSource.filter = filterValue;
  }

  getFilterFunction(filterType: string): (value: string, filterValue: string) => boolean {
    switch (filterType) {
      case 'contains':
        return (value: string, filterValue: string) => {
          return value.toLowerCase().includes(filterValue.toLowerCase());
        };
      case 'notContains':
        return (value: string, filterValue: string) => {
          return !value.toLowerCase().includes(filterValue.toLowerCase());
        };
      case 'startsWith':
        return (value: string, filterValue: string) => {
          return value.toLowerCase().startsWith(filterValue.toLowerCase());
        };
      case 'endsWith':
        return (value: string, filterValue: string) => {
          return value.toLowerCase().endsWith(filterValue.toLowerCase());
        };
      case 'equals':
        return (value: string, filterValue: string) => {
          return value.toLowerCase() === filterValue.toLowerCase();
        };
      case 'notEquals':
        return (value: string, filterValue: string) => {
          return value.toLowerCase() !== filterValue.toLowerCase();
        };
      default:
        return (value: string, filterValue: string) => {
          return value.toLowerCase().includes(filterValue.toLowerCase());
        };
    }
  }

  closeOtherDropdowns(openedDropdown: FilterDropdownComponent) {
    if (this.currentOpenedDropdown && this.currentOpenedDropdown !== openedDropdown) {
      this.currentOpenedDropdown.openDropdown = false;
    }
    this.currentOpenedDropdown = openedDropdown;
  }

}

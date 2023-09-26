import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filter-dropdown',
  templateUrl: './filter-dropdown.component.html',
  styleUrls: ['./filter-dropdown.component.css']
})
export class FilterDropdownComponent {
  @Input() isLast!: boolean;
  @Input() column!: string;
  @Output() applyFilter = new EventEmitter<{filterValue: string, column: string, filterType: string}>();
  @Output() filterOpened = new EventEmitter<FilterDropdownComponent>();
  openDropdown = false;
  filterType: string = 'contains';
  filterValue!: string;

  toggleDropdown() {
    this.openDropdown = !this.openDropdown;
    if (this.openDropdown) {
      this.filterOpened.emit(this);
    }
  }

  onFilterTypeChange(filterType: string) {
    this.filterType = filterType;
  }

  onFilterInput(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.applyFilter.emit({filterValue, column: this.column, filterType: this.filterType});
  }
}
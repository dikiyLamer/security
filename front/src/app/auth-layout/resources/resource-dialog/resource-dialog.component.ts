import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ResourceAttribute } from 'src/app/interfaces/resource-attribute.interface';
import { Resource } from 'src/app/interfaces/resource.interface';
import { ResourceAttributeService } from 'src/app/services/resource-attribute.service';
import { ResourceService } from 'src/app/services/resource.service';

@Component({
  selector: 'app-resource-dialog',
  templateUrl: './resource-dialog.component.html',
  styleUrls: ['./resource-dialog.component.css']
})
export class ResourceDialogComponent implements OnInit {

  resourceUpdateForm!: FormGroup
  updateAttributeForm!: FormGroup
  rowToEdit: number = -1

  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['name', 'alias', 'description', 'button']
  dataSource = new MatTableDataSource<ResourceAttribute>();

  attributes: ResourceAttribute[] = []

  constructor(@Inject(MAT_DIALOG_DATA) public resource: Resource,
    public dialogRef: MatDialogRef<ResourceDialogComponent>,
    private _liveAnnouncer: LiveAnnouncer,
    private resourceAttributeService: ResourceAttributeService,
    private resourceService: ResourceService,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.resourceUpdateForm = this.fb.group({
      alias: [this.resource.alias],
      description: [this.resource.description]
    })
    this.updateAttributeForm = this.fb.group({
      alias: [''],
      description: ['']
    })
    this.resourceAttributeService.getAttributesByResourceUid(this.resource.uid).subscribe(data => {
      this.dataSource.data = data
      this.attributes = data
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

  //Обновляем alias\description
  updateResource() {
    this.resourceService.updateResourceByUid(this.resource.uid, this.resourceUpdateForm.value).subscribe(data => {
      this.resource.alias = data.alias
      this.resource.description = data.description
    })
  }

  editAttribute(index: number) {
    this.updateAttributeForm = this.fb.group({
      alias: [this.attributes[index].alias],
      description: [this.attributes[index].description]
    })
    this.rowToEdit = index
  }

  updateAttribute() {
    this.resourceAttributeService.updateResourceAttribute(
      {
        uid: this.attributes[this.rowToEdit].uid,
        alias: this.updateAttributeForm.value.alias,
        description: this.updateAttributeForm.value.description
      }).subscribe(data => {
        this.attributes[this.rowToEdit] = data
        this.dataSource.data = this.attributes
        this.rowToEdit = -1
        this.updateAttributeForm.reset()
      })
  }

  closeDialog(){
    this.dialogRef.close(this.resource)
  }
}

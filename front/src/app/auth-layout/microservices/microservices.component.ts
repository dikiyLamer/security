import {Component, EventEmitter, Inject, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, FormsModule, Validators} from '@angular/forms';
import { IMicroservice } from 'src/app/interfaces/microservice.interface';
import { MicroserviceService } from 'src/app/services/microservices.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {MatFormFieldModule} from "@angular/material/form-field";
import {NgIf} from "@angular/common";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {v4} from "uuid";

export interface DialogData {
  name: string,
  path: string
}

@Component({
  selector: 'app-microservices',
  templateUrl: './microservices.component.html',
  styleUrls: ['./microservices.component.scss']
})
export class MicroservicesComponent implements OnInit{

  constructor(private microserviceService: MicroserviceService,
              public dialog: MatDialog,
              private ws: WebsocketService) {

  }

  microservices: IMicroservice[] = []
  createButtonClicked: boolean = false
  displayedColumns = ['uid', 'name', 'route', 'port']
  serviceToEdit?: IMicroservice

  openDialog(micro?: any): void {
    console.log(micro)
    let dialogRef
    if (micro) {
      dialogRef = this.dialog.open(CreateMicroservice, {
        data: {name: micro.name, path: micro.route}
      });
    } else {
      dialogRef = this.dialog.open(CreateMicroservice, {
        data: {name: "", path: ""}
      });
    }

    dialogRef.afterClosed().subscribe(result => {
      if (micro) {
        let microservice: IMicroservice = {
          uid: micro.uid,
          name: result.name,
          route: result.path,
        }
        this.onSubmitPopupUpdate(microservice)
      } else {
        let microservice: IMicroservice = {

          uid: v4(),
          name: result.name,
          route: result.path,
        }
        //  this.onPopupDataCreate.emit(microservice)
        this.onSubmitPopupCreate(microservice)
        console.log(result)
      }
    });
  }


  ngOnInit(): void {

    this.microserviceService.getMicroservices().subscribe(data => this.microservices = data)
    this.ws.delete_microservice().subscribe(data => this.microservices = this.microservices.filter(element => element.uid != JSON.parse(data).status))
    this.ws.create_microservice().subscribe(data => {
      console.log('microservice create data', data)
      this.microservices = [...this.microservices, JSON.parse(data).status]
    })
    this.ws.update_microservice().subscribe(data => {
      let element = this.microservices.find(element => element.uid === JSON.parse(data).status.uid)

      element!.name = JSON.parse(data).status.name
      element!.route = JSON.parse(data).status.route

    })



  }


  onSubmitPopupCreate(microservice: IMicroservice){
    this.serviceToEdit = undefined
    this.createButtonClicked = !this.createButtonClicked
    this.microserviceService.createMicroservice(microservice).subscribe()
  }

  onSubmitPopupUpdate(microservice: IMicroservice){


    this.serviceToEdit = undefined
    this.createButtonClicked = !this.createButtonClicked
    this.microserviceService.updateMicroservice(microservice).subscribe()
  }

  deleteMicroservice(service: IMicroservice){

    this.microserviceService.deleteMicroservice(service).subscribe()

  }

  synchronizeMicroservice(service: IMicroservice){

    this.microserviceService.synchronizeMicroservices(service).subscribe((data: any) => console.log(data))

  }



  onEditMicroservice(microservice: IMicroservice){

    this.serviceToEdit = microservice
    this.createButtonClicked = !this.createButtonClicked

  }

}

@Component({
  selector: 'adding-directory-dialog',
  templateUrl: 'adding-directory.dialog.html',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, NgIf, MatCheckboxModule],
})
export class CreateMicroservice {
  constructor(
    public dialogRef: MatDialogRef<CreateMicroservice>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { RuleService } from 'src/app/services/rule.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Rule } from 'src/app/interfaces/rule.interface';
import { WebsocketService } from 'src/app/services/websocket.service';
import { ResourceService } from 'src/app/services/resource.service';
import { Resource } from 'src/app/interfaces/resource.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RuleUpdateDto } from 'src/app/dto/rule-update.dto';
import { MicroserviceService } from 'src/app/services/microservices.service';
import { IMicroservice } from 'src/app/interfaces/microservice.interface';

/*
*@title 123
*/
@Component({
  selector: 'app-view-rules',
  templateUrl: './view-rules.component.html',
  styleUrls: ['./view-rules.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ViewRulesComponent implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = ['name', 'description'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'action', 'expand'];
  dataSource!: MatTableDataSource<Rule>;
  expandedElement: boolean = false;
  infoToggled: boolean = false
  resources: any
  users: any
  isRuleRowType: boolean = false
  

  @ViewChild('resUid') resUid!: ElementRef
  @ViewChild('msUid') msUid!: ElementRef

  formChanges!: FormGroup;

  dataForChanges!: Rule;

  arrayResources!: Resource[]
  arrayMicroservices!: IMicroservice[]

  isButtonClick: boolean = false
  filtersInvisible: boolean = true


  constructor(private readonly ruleService: RuleService,
    private readonly resourceService: ResourceService,
    private readonly microserviceService: MicroserviceService,
    private readonly ws: WebsocketService,
    private fb: FormBuilder) {

  }

  ngOnInit(): void {

    this.microserviceService.getMicroservices().subscribe(data => {

      this.arrayMicroservices = data
    })

    this.ruleService.getRules().subscribe(data => {
      console.log(data);
      
      this.dataSource = new MatTableDataSource(data as Rule[])
    })

    this.ws.delete_rule()
      .subscribe(data => {
        this.dataSource.data = this.dataSource.data
          .filter(element => element.uid != JSON.parse(data).status)
      })

    this.ws.create_rule().subscribe()

  }

  changeDataInTable() {

    if (this.resUid.nativeElement.value) {
      this.ruleService.getRulesByResource(this.resUid.nativeElement.value).subscribe(data => {
        this.dataSource = data
      })
    }
    else if (this.msUid.nativeElement.value) {

    }

  }

  changeMicroserviceFilter(e: any) {
    this.microserviceService.getRuleByMicroserviceId(e.target.value).subscribe(data => {

      this.dataSource.data = data
    })

    this.microserviceService.getRsourceByMicroserviceId(e.target.value).subscribe(data => {

      this.arrayResources = data
    })


  }

  changeRule() {
    let updateRule: RuleUpdateDto = {
      microservice: this.formChanges.value.microservice,
      resource_name: this.formChanges.value.resource_name,
      name: this.formChanges.value.name,
      description: this.formChanges.value.description
    };
    this.ruleService.updateRule(updateRule).subscribe(data => {
    })
  }


  ngAfterViewInit() {

    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onClickToRow(element: any) {
    this.isRuleRowType = element.type === 'row' ? true : false
    this.infoToggled = true
    this.ruleService.getResourcesAndUsers(element).subscribe(data => {
      this.users = data.users
      this.resources = data.resources
    })
    this.dataForChanges = element
    this.formChanges = this.fb.group({

      microservice: this.dataForChanges.microservice,
      resource_name: this.dataForChanges.resource_name,
      name: this.dataForChanges.name,
      description: this.dataForChanges.description
    })
  }

  onClickDelete(element: any) {

    this.ruleService.deleteRule(element).subscribe();

  }

  closeInfo() {
    this.infoToggled = false
  }
}

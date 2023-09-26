import { AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, fromEvent, Observable } from 'rxjs';
import { Resource } from 'src/app/interfaces/resource.interface';
import { User } from 'src/app/interfaces/user.interface';
import { Role } from 'src/app/interfaces/role.interface';
import { ResourceService } from 'src/app/services/resource.service';
import { AuthService } from 'src/app/services/auth.service';
import { RuleService } from 'src/app/services/rule.service';
import { WebsocketService } from "../../../services/websocket.service";
import { MicroserviceService } from 'src/app/services/microservices.service';
import { IMicroservice } from 'src/app/interfaces/microservice.interface';
import { ResourceAttribute } from 'src/app/interfaces/resource-attribute.interface';
import { RuleForField } from 'src/app/interfaces/rule-for-field.intarface';
import { ResourceAttributeService } from 'src/app/services/resource-attribute.service';

@Component({
  selector: 'app-create-rules-fields',
  templateUrl: './create-rules-fields.component.html',
  styleUrls: ['./create-rules-fields.component.scss']
})
export class CreateRulesFieldsComponent {
  constructor(private resourceService: ResourceService,
    private resourceAttributeService: ResourceAttributeService,
    private microserviceService: MicroserviceService,
    private websocketService: WebsocketService,
    private authService: AuthService,
    private fb: FormBuilder,
    private ruleService: RuleService
  ) { }

  @ViewChildren('checkboxes')
  checkboxes!: QueryList<ElementRef>

  @ViewChild('resourceNameStatic', { static: true })
  resourceNameStatic!: ElementRef

  @ViewChild('subjValueStatic', { static: true })
  subjValueStatic!: ElementRef


  @ViewChild('subjOperatorStatic', { static: true })
  subjOperatorStatic!: ElementRef

  @ViewChild('subjAttributeStatic', { static: true })
  subjAttributeStatic!: ElementRef

  @ViewChild('microserviceStatic', { static: true })
  microserviceStatic!: ElementRef


  @ViewChild('addUserFrame', { static: true })
  addUserFrameButton!: ElementRef


  userOpenState = false;

  dinamicAttribute: string = ''
  dinamicValue: string = ''
  dinamicCounter: number = 0

  listenerCount: number = 0
  valueTouched: boolean = false;

  subjAttributeStatic$!: Observable<any>;
  microserviceStatic$!: Observable<any>;

  resources: Resource[][] = []
  microservices: IMicroservice[][] = []
  attributes: ResourceAttribute[][] = []
  fields: { name: string, state: boolean }[] = []

  subjAttributeNames: any
  subjAttributeValues: any = []
  users: User[] = []

  searchResourceName$!: Observable<any>
  searchUsersRoles$!: Observable<any>
  searchSubjAttributeStatic$!: Observable<any>
  searchSubjOperatorStatic!: Observable<any>

  dataTargetValue: any;

  userFrameCount: boolean[] = []

  previewUsersArrayAttributes: string[] = []
  previewUsersArrayValues: any[] = []
  userData: any[] = []

  // Форма для добавления массива объектов с помощью одной формы
  ruleForm = this.fb.group({
    ruleName: new FormControl(null, Validators.required),
    ruleDescription: new FormControl(null),
    action: new FormControl(null, Validators.required),
    resourceNameStatic: new FormControl(null, Validators.required),
    microserviceStatic: new FormControl(null, Validators.required),
    subjAttributeStatic: new FormControl(null, Validators.required),
    subjOperatorStatic: new FormControl('Равно'),
    subjValueStatic: new FormControl(null, Validators.required),
    user: this.fb.array([])
  })

  // Геттер для формы массива пользователей
  get user() {
    return this.ruleForm.controls["user"] as FormArray;
  }

  ngOnInit(): void {
    this.websocketService.message0$.subscribe(data => {
      this.userData = JSON.parse(data);
      console.log('received data', this.userData)
    })

    this.microserviceService.getMicroservices().subscribe(data => {
      this.microservices[0] = data
    })
  }

  deleteUser(index: number) {
    this.user.removeAt(index);
    this.userFrameCount.pop()
    const newArray = this.previewUsersArrayValues.map((item: any, index) => {
      return { name: this.previewUsersArrayAttributes[index], value: item }
    })
    newArray.splice(index + 1, 1)
    this.authService.previewUsers(newArray).subscribe(data => { })
  }

  addUser() {

    const userForm = this.fb.group({
      subjAttribute: new FormControl(null),
      subjOperator: new FormControl('Равно'),
      subjValue: new FormControl(null),
    });

    this.user.push(userForm);
    this.userFrameCount.push(true)

  }

  previewResource() {
    // this.authService.previewResources([{resource: this.resources.name; attribute: this.attributes}]).subscribe(data => {
    //   console.log(data)
    // })

    console.log('RESOURCES:', this.resources)
    console.log('ATTRIBUTES:', this.attributes)
  }

  ngAfterViewInit(): void {
    // Создаем обсервабле для первой формы ресурсов для взятия из базы данных по шаблону
    this.subjAttributeStatic$ = fromEvent(this.subjAttributeStatic.nativeElement, 'change')
    this.subjAttributeStatic$.subscribe((data: Event) => {

      this.dataTargetValue = (data.target as HTMLSelectElement).value;
      this.authService.getSubjAttrValuesByPattern({ subjAttribute: this.dataTargetValue, subjOperator: 'Равно', subjValue: '' }).subscribe(data => {
        this.subjAttributeValues[0] = data
      })
      this.previewUsersArrayAttributes[0] = this.dataTargetValue;
    })


    this.microserviceStatic$ = fromEvent(this.microserviceStatic.nativeElement, 'change')
      .pipe(debounceTime(500),
        distinctUntilChanged())

    this.microserviceStatic$.subscribe(data => {

      this.microserviceService.getRsourceByMicroserviceId(((data as InputEvent).target as HTMLInputElement).value).subscribe((data) => {
        this.resources[0] = data

      })
    })

    this.searchResourceName$ = fromEvent(this.resourceNameStatic.nativeElement, 'change')
      .pipe(debounceTime(500),
        distinctUntilChanged())
    this.searchResourceName$.subscribe(data => {
      console.log(data.target.value);
      this.resourceAttributeService.getAttributesByResourceUid(data.target.value).subscribe(attributes => {
        this.attributes[0] = attributes
        setTimeout(() => {
          this.fields = []
          this.checkboxes.forEach((checkbox) => {
            console.log(checkbox);
            this.fields.push({ name: checkbox.nativeElement.id, state: false })
          })
        }, 0)
      })
    })
    // Создаем обсервабле для первой формы пользователей для взятия из БД атрибутов по шаблону
    this.authService.getSubjAttributesByPattern('').subscribe(res => {
      this.subjAttributeNames = res;
    })

    // обсервабле для поиска по БД значений атрибутов пользователей
    this.searchUsersRoles$ = fromEvent(this.subjValueStatic.nativeElement, 'change')
    this.searchUsersRoles$.subscribe((data: Event) => {
      this.valueTouched = true
      this.previewUsersArrayValues[0] = (data.target as HTMLInputElement).value;
      const newArray = this.previewUsersArrayValues.map((item: any, index) => {
        return { name: this.previewUsersArrayAttributes[index], value: item }
      })
      this.authService.previewUsers(newArray).subscribe()
    })
  }

  listener = (data: Event, index: number) => {

    let currentInputElement = ((data as InputEvent).target as HTMLSelectElement).attributes.getNamedItem('id')?.value

    setTimeout(() => {

      if (this.listenerCount !== 0) {

        if (currentInputElement?.toString().includes('resourceName')) {

          this.resourceService.getResourcesForInput((document.getElementById(currentInputElement?.toString()) as HTMLSelectElement).value).subscribe(res => {
            this.resourceAttributeService.getAttributesByResourceUid(res.uid).subscribe(attrs => {
              this.attributes[0] = attrs
              console.log(attrs);
            })
          })
        }
        if (currentInputElement?.toString().includes('subjValue')) {

          this.dinamicAttribute = (document.getElementById(`subjAttribute${this.dinamicCounter}`) as HTMLSelectElement).value
          this.dinamicValue = (document.getElementById(`subjValue${index}`) as HTMLSelectElement).value
          console.log('dinamic val', this.dinamicValue)

          this.previewUsersArrayValues[parseInt(currentInputElement?.toString().replace('subjValue', '')) + 1] = this.dinamicValue
          console.log('old arr', this.previewUsersArrayValues)
          const newArray = this.previewUsersArrayValues.map((item: any, index) => {
            return { name: this.previewUsersArrayAttributes[index], value: item }
          })
          console.log('new arr', newArray)
          this.authService.previewUsers(newArray).subscribe(data => {
          })
        }
        else if (currentInputElement?.toString().includes('subjAttribute')) {
          this.dinamicAttribute = (document.getElementById(currentInputElement?.toString()) as HTMLSelectElement).value
          this.previewUsersArrayAttributes[parseInt(currentInputElement?.toString().replace('subjAttribute', '')) + 1] = this.dinamicAttribute
          this.authService.getSubjAttrValuesByPattern(
            {
              subjAttribute: this.dinamicAttribute,
              subjOperator: 'Равно',
              subjValue: ((data as InputEvent).srcElement as HTMLInputElement).value
            }
          )
            .subscribe(res => {
              this.subjAttributeValues[parseInt(currentInputElement!.toString().replace("subjAttribute", '')) + 1] = res
            })//
        }
        this.listenerCount = 0
      }
    }, 500);
    this.listenerCount++
  }

  onSubmit() {


    console.log({ ...this.ruleForm.value, fields: this.fields.filter(elem => elem.state === false).map(elem => elem.name).toString() });

    this.ruleService.createRuleForField({ ...this.ruleForm.value, fields: this.fields.filter(elem => elem.state === false).map(elem => elem.name).toString() } as unknown as RuleForField).subscribe(
      data => {
        console.log(data);
      }
    )


    // this.ruleForm.reset()

  }

  checkboxChanged(index: number) {
    this.fields[index].state = ((this.checkboxes.get(index)!.nativeElement as HTMLInputElement).checked)
    console.log(this.fields);

  }
}
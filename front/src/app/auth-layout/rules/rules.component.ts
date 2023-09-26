import { AfterContentChecked, AfterContentInit, AfterViewInit, Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, fromEvent, Observable } from 'rxjs';
import { Resource } from 'src/app/interfaces/resource.interface';
import { User } from 'src/app/interfaces/user.interface';
import { Role } from 'src/app/interfaces/role.interface';
import { ResourceService } from 'src/app/services/resource.service';
import { AuthService } from 'src/app/services/auth.service';
import { RuleService } from 'src/app/services/rule.service';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit{
  view = false
  ngOnInit(): void {
    
  }

  unView(){
    this.view = false
  }
  viewRules(){
    this.view = true
  }


}
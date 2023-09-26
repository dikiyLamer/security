import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthLayoutComponent } from './auth-layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RulesComponent } from './rules/rules.component';
import { ResourcesComponent } from './resources/resources.component';
import { MicroservicesComponent } from './microservices/microservices.component';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { MaterialImportsModule } from '../material-imports/material-imports.module';
import { ViewRulesComponent } from './rules/view-rules/view-rules.component';
import { CreateRulesComponent } from './rules/create-rules/create-rules.component';
import { AuthRoutingModule } from './auth-layout-routing.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { initializeKeycloak } from '../keycloak/keycloak-init.factory';
import { AuthService } from '../services/auth.service';
import { MicroserviceService } from '../services/microservices.service';
import { ResourceService } from '../services/resource.service';
import { RuleService } from '../services/rule.service';
import { WebsocketService } from '../services/websocket.service';
import { FormatPipe } from '../pipes/format.pipe';
import {MatDialog, MatDialogModule} from "@angular/material/dialog";
import {MatExpansionModule} from "@angular/material/expansion";
import { UpperPipe } from '../pipes/toUpperFirst.pipe';
import { CreateRulesFieldsComponent } from './rules/create-rules-fields/create-rules-fields.component';
import { FilterDirective } from '../directives/filter.directive';
import { ResourceDialogComponent } from './resources/resource-dialog/resource-dialog.component';
import { FilterDropdownComponent } from './filter-dropdown/filter-dropdown.component';



@NgModule({
  declarations: [
    AuthLayoutComponent,
    RulesComponent,
    ResourcesComponent,
    MicroservicesComponent,
    ViewRulesComponent,
    CreateRulesComponent,
    FormatPipe,
    UpperPipe,
    CreateRulesFieldsComponent,
    FilterDirective,
    ResourceDialogComponent,
    FilterDropdownComponent,

  ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        // KeycloakAngularModule,
        MaterialImportsModule,
        AuthRoutingModule,
        MatDialogModule,
        MatExpansionModule
    ],
  providers:[
    AuthService,
    MicroserviceService,
    ResourceService,
    RuleService,
    WebsocketService,
    MatDialog
  ],

})
export class AuthLayoutModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ViewRulesComponent } from './rules/view-rules/view-rules.component';
import { CreateRulesComponent } from './rules/create-rules/create-rules.component';
import { ResourcesComponent } from './resources/resources.component';
import { MicroservicesComponent } from './microservices/microservices.component';
import { AuthLayoutComponent } from './auth-layout.component';
import { CreateRulesFieldsComponent } from './rules/create-rules-fields/create-rules-fields.component';

const routes: Routes = [
  {path:'', component:AuthLayoutComponent, children: [
      {path:'', pathMatch: 'full', redirectTo: 'rules'},
      {path:'rules', component: ViewRulesComponent},
      {path: 'rules/createRules', component: CreateRulesComponent},
      {path: 'rules/createRulesForFields', component: CreateRulesFieldsComponent},
      {path:'resources', component: ResourcesComponent},
      {path:'microservices', component: MicroservicesComponent},
    ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }

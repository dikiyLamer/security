import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Role } from '../interfaces/role.interface';
import { User } from '../interfaces/user.interface';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
  
})
export class AuthLayoutComponent implements OnInit{


  roles: [{name: string}] = [{name: ''}]
  users: User[] = []
  roleForm!: FormGroup
  selectedUser: string = ''
  selectedRole: string = ''
  showFiller = false;
  /**
   *
   */
  constructor(private auth: AuthService) {
    
  }

  

  ngOnInit(): void {
    
    // this.roleForm = new FormGroup({

    // })

    //this.auth.getRoles().subscribe(data => this.roles= <Role[]>data)
    this.auth.getUsers().subscribe(data => this.users= <User[]>data)

  }

  onSubmit(){

    let user: User | undefined
  
    user = this.users.find(value => value.username === this.selectedUser)
    //role = this.roles.find(value => value.name === this.selectedRole)
    this.auth.unionRoleWithUser(user).subscribe(data => this.roles = data)

  }

}

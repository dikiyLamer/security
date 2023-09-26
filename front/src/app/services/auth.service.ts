import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Role } from "../interfaces/role.interface";
import { User } from "../interfaces/user.interface";
import { UserRoleToBack } from "../interfaces/userRoleToBack.interface";
import { mainURL } from "src/environments/environment";

@Injectable()
export class AuthService{
    /**
     *
     */
    constructor(private http: HttpClient) {

    }

    getRoles(): Observable<any>{
        return this.http.get(`${mainURL}/api/auth/roles`)
    }

  previewUsers(data: any): Observable<any>{
    return this.http.post(`${mainURL}/api/auth/preview_users`, data)
  }

  previewResources(data: {resource: string, attribute: string, value: string}): Observable<any>{
    return this.http.post(`${mainURL}/api/auth/check_existing_res`, data)
  }

    getUsers(): Observable<any>{
        return this.http.get(`${mainURL}/api/auth/users`)
    }

    unionRoleWithUser(user : User | undefined): Observable<any>{

        return this.http.post(`${mainURL}/api/auth/userRole`,user)
    }

    getSubjAttributesByPattern(pattern: string){
        return this.http.post(`${mainURL}/api/auth/subjAttributes/pattern`, {pattern: pattern})
    }

    getSubjAttrValuesByPattern(pattern: UserRoleToBack){
      console.log('1241241')
        return this.http.post(`${mainURL}/api/auth/subjAttrValues/pattern`, pattern)
    }


}
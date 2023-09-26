import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { mainURL } from "src/environments/environment";
import { RuleUpdateDto } from "../dto/rule-update.dto";
import { RuleForField } from "../interfaces/rule-for-field.intarface";


@Injectable()
export class RuleService{
    /**
     *
     */
    constructor(private http: HttpClient) {

    }

    getRules(): Observable<any>{
        return this.http.get(`${mainURL}/api/auth/rule`)
    }

    getRulesByResource(id: number):Observable<any>{
        return this.http.get(`${mainURL}/api/auth/rules/${id}`)
    }

    getResourcesAndUsers(uid: string){
        return this.http.post<{users:[], resources:[]}>(`${mainURL}/api/auth/resourceUsers`, uid)
    }

    createRule(rule: any): Observable<any>{
        return this.http.post(`${mainURL}/api/auth/rule`, rule)
    }

    updateRule(rule: RuleUpdateDto): Observable<any>{
        return this.http.post(`${mainURL}/api/auth/ruleupdate`, rule)
    }

    deleteRule(rule: any): Observable<any>{
        return this.http.delete(`${mainURL}/api/auth/rule`, {body: rule})
    }
    
    createRuleForField(rule: RuleForField){
        return this.http.post(`${mainURL}/api/auth/ruleForField`, rule)
    }

}
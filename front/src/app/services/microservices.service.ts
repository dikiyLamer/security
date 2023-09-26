import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IMicroservice } from "../interfaces/microservice.interface";
import { Message } from "../interfaces/message";
import { mainURL } from "src/environments/environment";
import { Resource } from "../interfaces/resource.interface";
import { Rule } from "../interfaces/rule.interface";

@Injectable()
export class MicroserviceService{
    /**
     *
     */
    constructor(private http: HttpClient) {

    }

    getMicroservices(): Observable<IMicroservice[]>{
        return this.http.get<IMicroservice[]>(`${mainURL}/api/auth/microservice`)
    }

    createMicroservice(microservice: IMicroservice): Observable<IMicroservice>{
        return this.http.post<IMicroservice>(`${mainURL}/api/auth/microservice`, microservice)
    }

    updateMicroservice(microservice: IMicroservice): Observable<IMicroservice>{
        return this.http.put<IMicroservice>(`${mainURL}/api/auth/microservice`, microservice)
    }

    deleteMicroservice(microservice : IMicroservice) : Observable<string> {

        return this.http.delete<string>(`${mainURL}/api/auth/microservice/${microservice.uid}`)
    
    }

    synchronizeMicroservices(microservice : IMicroservice): Observable<Message>{
        return this.http.post<Message>(`${mainURL}/api/auth/microservice/synch`, microservice)
    }
   
    getRsourceByMicroserviceId(uid: string):Observable< Resource[]>{
        return this.http.get< Resource[]>(`${mainURL}/api/auth/microservice/resource/${uid}`)
    }

    getRuleByMicroserviceId(uid: string): Observable<Rule[]>{
        return this.http.get<Rule[]>(`${mainURL}/api/auth/microservice/rule/${uid}`)
    }
    

}
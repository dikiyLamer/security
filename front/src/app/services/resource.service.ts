import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { debounceTime, Observable } from "rxjs";
import { IMicroservice } from "../interfaces/microservice.interface";
import { Resource } from "../interfaces/resource.interface";
import { mainURL } from "src/environments/environment";
import { ResourceUpdate } from "../dto/resource-update.dto";
import { ResourceAttribute } from "../interfaces/resource-attribute.interface";

@Injectable()
export class ResourceService{
    /**
     *
     */
    constructor(private http: HttpClient) {
        
    }

    getResources(): Observable<Resource[]>{
        return this.http.get<Resource[]>(`${mainURL}/api/auth/resource`)
    }

    getResourcesForInput(data: string): Observable<Resource>{
      
        return this.http.post<Resource>(`${mainURL}/api/auth/resource`, {pattern: data})
    }

    updateResourceByUid(uid: string, resourceUpdate: ResourceUpdate):Observable<Resource>{
        return this.http.post<Resource>(`${mainURL}/api/auth/resource-update/${uid}`, resourceUpdate)
    }
    
}
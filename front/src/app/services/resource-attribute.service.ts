import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResourceAttribute } from '../interfaces/resource-attribute.interface';
import { mainURL } from 'src/environments/environment';
import { ResourceAttributeUpdate } from '../dto/resource-attribute-update.dto';

@Injectable({
  providedIn: 'root'
})
export class ResourceAttributeService {

  constructor(private http: HttpClient) { }

  getAttributesByResourceUid(uidResource: string):Observable<ResourceAttribute[]>{
    return this.http.get<ResourceAttribute[]>(`${mainURL}/api/auth/resource-attributes/${uidResource}`)
  }

  updateResourceAttribute(resourceAttributeUpdate: ResourceAttributeUpdate):Observable<ResourceAttribute>{
    return this.http.post<ResourceAttribute>(`${mainURL}/api/auth/resource-attribute`, resourceAttributeUpdate)
  }

  updateResourceAttributes(resourceAttributeUpdate: ResourceAttributeUpdate[]):Observable<ResourceAttribute[]>{
    return this.http.post<ResourceAttribute[]>(`${mainURL}/api/auth/resource-attributes`, resourceAttributeUpdate)
  }
}

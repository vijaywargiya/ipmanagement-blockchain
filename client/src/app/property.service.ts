import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';
import {UserService} from './user.service';


@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private userService: UserService) {
  }

  getSelfProperties(): Observable<object> {
    const url = this.baseUrl + '/api/property/self';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.get(url, httpOptions);
  }

  getAllProperties(): Observable<object> {
    const url = this.baseUrl + '/api/property';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.get(url, httpOptions);
  }

  create(data: object): Observable<object> {
    const url = this.baseUrl + '/api/property';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.post(url, JSON.stringify(data), httpOptions);
  }

  getOwner(property_id: bigint): Observable<string> {
    const url = this.baseUrl + '/api/property/owner/' + property_id;
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    const response =  this.http.post(url, httpOptions);
    return response['data'];
  }

}

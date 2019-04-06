import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';
import {UserService} from './user.service';


@Injectable({
  providedIn: 'root'
})
export class MiningService {

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, public userService: UserService) {
  }


  public mine(): Observable<object> {
    const url = this.baseUrl + '/api/mine';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.post(url, '', httpOptions);
  }

}



import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private userService: UserService) {
  }

  send(property_id: number, body: string): Observable<object> {
    const data = {
      property_id: property_id,
      body: body
    };
    const url = this.baseUrl + '/api/message';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.post(url, JSON.stringify(data), httpOptions);
  }

  get_all() {
    const url = this.baseUrl + '/api/message';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.get(url, httpOptions);
  }

  get_unread() {
    const url = this.baseUrl + '/api/message/unread';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.get(url, httpOptions);
  }

  respond(message_id: number, body: string) {
    const data = {
      body: body
    };
    const url = this.baseUrl + '/api/message/' + message_id + '/respond';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.post(url, JSON.stringify(data), httpOptions);

  }
}

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';
import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})

export class TransactionService {


  baseUrl = environment.baseUrl;


  constructor(private http: HttpClient, private userService: UserService) {
  }

  getSelfTransactions(): Observable<object> {
    const url = this.baseUrl + '/api/transaction/self';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.get(url, httpOptions);
  }

  getAllTransactions(): Observable<object> {
    const url = this.baseUrl + '/api/transaction';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.get(url, httpOptions);
  }

  create(data: object): Observable<object> {
    const url = this.baseUrl + '/api/transaction';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': 'JWT ' + this.userService.token
      })
    };
    return this.http.post(url, JSON.stringify(data), httpOptions);
  }


}

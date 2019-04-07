import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';
import {Router} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';

@Injectable()
export class UserService {

  public name = '';
  public email = '';
  public date_joined = '';
  public user_address = '';
  public coins = 0;

  // http options used for making API calls
  private httpOptions: any;

  // the actual JWT token
  public token: string;

  // the token expiration date
  public tokenExpires: Date;


  // error messages received from the login attempt
  public errors: any = [];

  baseUrl = environment.baseUrl;


  constructor(private http: HttpClient, public router: Router, private cookieService: CookieService) {
    this.httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    };

    if (cookieService.check('token')) {
      this.token = this.cookieService.get('token');
      this.get_user_details();
    }

  }

  // Uses http.post() to get an auth token from djangorestframework-jwt endpoint
  public login(user) {
    const url = this.baseUrl + '/api-token-auth/';
    this.http.post(url, JSON.stringify(user), this.httpOptions).subscribe(
      data => {
        this.updateData(data['token']);
        this.get_user_details();
        this.router.navigate(['/dashboard']);
      },
      err => {
        this.errors = err.error;
      }
    );
  }

  public register(user) {
    const url = this.baseUrl + '/register';
    this.http.post(url, JSON.stringify(user), this.httpOptions).subscribe(
      data => {
        this.router.navigate(['/login']);
      },
      err => {
        this.errors = err.error;
      }
    );
  }

  public get_user_details() {
    const url = this.baseUrl + '/user';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + this.token
      })
    };
    this.http.get(url, httpOptions).subscribe(
      data => {
        this.name = data['first_name'];
        this.email = data['email'];
        this.date_joined = data['date_joined'];
        this.user_address = data['user_address'];
        this.coins = data['coins'];
      });
  }

  // Refreshes the JWT token, to extend the time the user is logged in
  public refreshToken() {
    const url = this.baseUrl + '/api-token-refresh/';
    this.http.post(url, JSON.stringify({token: this.token}), this.httpOptions).subscribe(
      data => {
        this.updateData(data['token']);
      },
      err => {
        this.errors = err.error;
      }
    );
  }

  public logout() {
    this.token = null;
    this.tokenExpires = null;
  }

  private updateData(token) {
    this.token = token;
    this.errors = [];

    // decode the token to read the username and expiration timestamp
    const tokenParts = this.token.split(/\./);
    const tokenDecoded = JSON.parse(window.atob(tokenParts[1]));
    this.tokenExpires = new Date(tokenDecoded.exp * 1000);
    this.cookieService.set('token', this.token, this.tokenExpires);
  }

  public isAuthenticated(): boolean {
    if (!this.token) {
      return false;
    } else if (this.tokenExpires < new Date()) {
      this.refreshToken();
      return true;
    } else {
      return true;
    }

  }

}

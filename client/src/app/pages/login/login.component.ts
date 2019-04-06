import { Component, OnInit, OnDestroy } from '@angular/core';
import {UserService} from '../../user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  public user: any;

  constructor(public userService: UserService, public router: Router) {}

  ngOnInit() {
    this.user = {
      email: '',
      password: ''
    };
  }
  ngOnDestroy() {
  }

  login() {
    this.userService.login({email: this.user.email, password: this.user.password});
  }


}

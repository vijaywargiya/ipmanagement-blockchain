import {Component, OnInit} from '@angular/core';
import {UserService} from '../../user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public user: any;

  constructor(public userService: UserService) {
  }

  ngOnInit() {
    this.user = {
      name: '',
      email: '',
      password: '',
      checkbox: 0
    };
  }

  register() {
    this.userService.register({name: this.user.name, password: this.user.password, email: this.user.email});
  }
}

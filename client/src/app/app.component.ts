import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ip-management';

  public user: any;

  constructor(public userService: UserService, public router: Router) {
  }

  ngOnInit() {

  }

}

import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from './user.service';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ip-management';

  public user: any;

  constructor(public userService: UserService, public router: Router, public titleService: Title) {
    this.titleService.setTitle('Tokyo');
  }


}

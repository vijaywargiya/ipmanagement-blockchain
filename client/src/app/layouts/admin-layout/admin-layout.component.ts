import {Component, OnInit} from '@angular/core';
import {UserService} from '../../user.service';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {

  constructor(public userService: UserService, public router: Router, public titleService: Title) {
  }

  ngOnInit() {
    if (!this.userService.token) {
      this.titleService.setTitle('Tokyo');
      return this.router.navigate(['/login']);
    }
  }

}

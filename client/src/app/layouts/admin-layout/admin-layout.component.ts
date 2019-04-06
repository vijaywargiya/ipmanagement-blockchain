import {Component, OnInit} from '@angular/core';
import {UserService} from '../../user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {

  constructor(public userService: UserService, public router: Router) {
  }

  ngOnInit() {
    if (!this.userService.token) {
      return this.router.navigate(['/login']);
    }
  }

}

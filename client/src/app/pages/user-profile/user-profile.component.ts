import {Component, OnInit} from '@angular/core';
import {UserService} from '../../user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  constructor(public userService: UserService) {
  }

  ngOnInit() {
    this.userService.get_user_details();
  }

}

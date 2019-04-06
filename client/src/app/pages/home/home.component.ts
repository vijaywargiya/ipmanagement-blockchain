import { Component, OnInit, OnDestroy } from '@angular/core';
import {UserService} from '../../user.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public user: any;

  constructor(public userService: UserService, public router: Router) {}


  ngOnInit(): void {
  }


}

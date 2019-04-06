import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {UserService} from '../../user.service';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'ni-tv-2 text-primary', class: '' },
    { path: '/property', title: 'Property',  icon: 'ni-tv-2 text-primary', class: '' },
    { path: '/transaction', title: 'Transaction',  icon: 'ni-tv-2 text-primary', class: '' },
    { path: '/message', title: 'Message',  icon: 'ni-tv-2 text-primary', class: '' },
    { path: '/mining', title: 'Mining',  icon: 'ni-tv-2 text-primary', class: '' },
];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public menuItems: any[];
  public isCollapsed = true;

  constructor(private router: Router, public userService: UserService) { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.router.events.subscribe((event) => {
      this.isCollapsed = true;
   });
  }


  logout() {
    this.userService.logout();
  }


  getUserAddress() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.userService.user_address;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    alert('Address has been copied. This can be used to transfer properties to you');
  }
}

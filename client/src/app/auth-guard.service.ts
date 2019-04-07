import {Injectable} from '@angular/core';
import {Router, CanActivate} from '@angular/router';
import {UserService} from './user.service';

// @ts-ignore

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(public userService: UserService, public router: Router) {
  }

  canActivate() {
    if (!this.userService.isAuthenticated()) {
      return this.router.navigate(['/login']);
    }
    return true;
  }

}

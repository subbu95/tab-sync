import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStorageService } from './services/session-storage.service';
import { SessionKeys } from './models/common/login-model';
import { SharedService } from './services/shared.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const sessionStorageService = inject(SessionStorageService);
  const sharedService = inject(SharedService);
  const accessToken = sessionStorageService.get(SessionKeys.ACCESS_TOKEN);
  
  if (accessToken) {
    return true; 
  } else {
    sharedService.userLogout();
    return false;
  }
};

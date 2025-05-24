import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { SessionStorageService } from '../services/session-storage.service';
import { inject } from '@angular/core';
import { SessionKeys } from '../models/common/login-model';
import { catchError, throwError } from 'rxjs';
import { SharedService } from '../services/shared.service';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStorageService = inject(SessionStorageService);
  const sharedService = inject(SharedService);
  const excludedUrls = ['/auth/login', 'assets/i18n/@nielsen'];
  const removeAuthHeaderUrls = ["com/acnielsen/eclipse/session/setSessionAngular.action"];
  // let refreshTokenConfirmation: Boolean = false;


  if (excludedUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  let modifiedReq = req.clone({
    setHeaders: {
      'User-Id': sessionStorageService.get(SessionKeys.USER_ID),
      'User-Email': sessionStorageService.get(SessionKeys.EMAIL),
      'User-Name': sessionStorageService.get(SessionKeys.USER_NAME),
      'Authorization': `Bearer ${sessionStorageService.get(SessionKeys.ACCESS_TOKEN)}`
    }
  });

  if (removeAuthHeaderUrls.some(url => req.url.includes(url))) {
    modifiedReq = modifiedReq.clone({
      headers: modifiedReq.headers.delete("Authorization")
    });
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error && error.status === 401)// We are unauthorized calling refresh token
      {
        // refreshTokenConfirmation = true;
        sharedService.getRefreshToken();
      }
      // else {
      //   return throwError(() => new Error('Refresh token call failed'))
      // }
      // sessionStorage.clear();
      // router.navigateByUrl('/login');

      return throwError(error);
    }
    )
  )
};


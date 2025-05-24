import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

export const parseBlobInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
            catchError(err => {
                if (err instanceof HttpErrorResponse && err.error instanceof Blob && err.error.type === "application/json") {
                    // https://github.com/angular/angular/issues/19888
                    // When request of type Blob, the error is also in Blob instead of object of the json data
                    return new Promise<any>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (e: Event) => {
                            try {
                                const errmsg = JSON.parse((e.target as any).result);
                                reject(new HttpErrorResponse({
                                    error: errmsg,
                                    headers: err.headers,
                                    status: err.status,
                                    statusText: err.statusText,
                                    url: err.url || undefined
                                }));
                            } catch (e) {
                              reject(err);
                              console.log(e);
                            }
                        };
                        reader.onerror = (e) => {
                          reject(err);
                          console.log(e);
                        };
                        reader.readAsText(err.error);
                    });
                }
                throw err;
            })
        );
};

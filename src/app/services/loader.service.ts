import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private activeRequests = 0;
  private loaderSubject = new BehaviorSubject<boolean>(false);
  loaderState$ = this.loaderSubject.asObservable();
  loaderImage = environment.imageBasePath+"images/NIQ-Loader.gif";
  spinnerImage = environment.imageBasePath+"images/Spinner.png";

  showLoader() {
    this.loaderSubject.next(true);
  }

  hideLoader() {
    this.loaderSubject.next(false);
  }

  public getNIQLoader() {
    return this.loaderImage;
  }

  public getNIQSpinner() {
    return this.spinnerImage;
  }
}

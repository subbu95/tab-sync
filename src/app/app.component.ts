import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { Router, RouterOutlet } from '@angular/router';
import { LoaderService } from './services/loader.service';
import { SpinnerModule } from '@nielseniq/athena-core';
import { NavBarComponent } from './layout/nav-bar/nav-bar.component';
import { SessionStorageService } from './services/session-storage.service';
import { SessionKeys } from './models/common/login-model';
import { SharedService } from './services/shared.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../environments/environment';
import { CronTaskComponent } from './shared/components/cron-task/cron-task.component';
import { UtilityService } from './services/utility.service';


@Component({
  selector: 'eclipse-root',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, SpinnerModule, NavBarComponent, CommonModule, CronTaskComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'cip-eclipse';
  isAuthenticated = false;
  NIQLoaderImage: any = "";

  constructor(private router: Router, private loaderService: LoaderService, private sessionStorage: SessionStorageService,
    private sharedService: SharedService, private cdr: ChangeDetectorRef, public utilityService: UtilityService) {
    this.NIQLoaderImage = this.loaderService.getNIQLoader();
  }

  ngOnInit() {
    this.loaderService.loaderState$.subscribe((state) => {
      this.utilityService.isLoading = state;
      this.cdr.detectChanges();
    });

    this.loaderService.showLoader();

    const accessToken = this.sessionStorage.get(SessionKeys.ACCESS_TOKEN);

    if (!accessToken) {
      this.sharedService.isAuthenticated$.subscribe(status => {
        this.isAuthenticated = status;
      });
    }
    else {
      this.isAuthenticated = true;
    }

    this.loaderService.hideLoader();

    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
      // window.location.href = `${environment.kawaURL}portal.action`;
    }
  }
}

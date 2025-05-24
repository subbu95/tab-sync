import { Component, ElementRef, HostListener, OnChanges, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { LegacyComponentService } from '../../services/legacy-component.service';
import { LoaderService } from '../../services/loader.service';
import { IframeTrackerDirective } from '../../shared/directives/iframe-tracker.directive';

@Component({
  selector: 'eclipse-legacy',
  standalone: true,
  imports: [IframeTrackerDirective],
  templateUrl: './legacy.component.html',
  styleUrl: './legacy.component.css'
})

export class LegacyComponent {
  public sanitizedSrc: SafeResourceUrl = '';
  public routeData: any;

  constructor(
    private sanitizer: DomSanitizer,
    private _router: Router,
    protected _legacyService: LegacyComponentService,
    protected loaderService: LoaderService,
    // protected _loaderService: LoaderService
  ) {
    this._legacyService.legacyUrl$.subscribe({
      next: (legacyUrl) => {
        console.log("REDIRECTING TO URL 1: " + legacyUrl)
        if (legacyUrl === '') {
          this._router.navigateByUrl('/');
        } else {
          this.setSrc(legacyUrl);
        }
      },
    });
    console.log("REDIRECTING TO URL 2:");

  }

  setSrc(legacyUrl: string): void{
    // this._loaderService.setLoading(true);
    console.log("REDIRECTING TO URL 3: " + legacyUrl);
    this.loaderService.showLoader();
    this.sanitizedSrc = this.sanitizer.bypassSecurityTrustResourceUrl(legacyUrl);
  }

  closeMenuDropdown(event: ElementRef): void {
    this._legacyService.sendIframeClickEvent(true);
  }

  // @HostListener('window:blur', ['$event'])
  // onWindowBlur(event: any): void {
  //   console.log('iframe clicked');
  // }

}


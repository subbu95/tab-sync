import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IconModule } from '@nielseniq/athena-core';
import { CommonModule } from '@angular/common';
import { MenuModule, ItemModule } from '@nielseniq/athena-core';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../services/session-storage.service';
import { SharedService } from '../../services/shared.service';
import { catchError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'eclipse-profile',
  standalone: true,
  imports: [IconModule, CommonModule, MenuModule, ItemModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  @Input() userName!: string;
  @Input() currentWorkteam!: string;
  @Input() instructionStatus!: string;
  @Input() sessionRunning!: boolean


  constructor(protected _sessionStorageService: SessionStorageService, protected _sharedService:SharedService,
    protected loaderService: LoaderService) { }

  public iconName = 'chevron-down';
  onOpenedChange(isOpened: boolean) {
    if (isOpened) {
      this.iconName = 'chevron-up'
    } else {
      this.iconName = 'chevron-down'
    }
  }
  
  public userLogout(_event: Event) {
    console.log(_event);
    this.loaderService.showLoader();
    this._sharedService.userLogout();
    this.loaderService.hideLoader();    
  }
}

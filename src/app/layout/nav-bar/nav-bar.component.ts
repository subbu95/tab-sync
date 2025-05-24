import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { IconModule, TabModule, MenuModule, ItemModule, DropDownModule, TooltipModule } from '@nielseniq/athena-core';
import { SubMenuComponent } from '../sub-menu/sub-menu.component';
import { MenuService } from '../../services/menu.service';
import { LanguageMenuItem, MenuItem, MenuKeys } from '../../models/common/menu-model';
import { MenuResponse, SubMenuItem } from '../../models/common/menu-model';
import { HttpClientModule } from '@angular/common/http';
import { ExternalMenuItem} from '../../models/common/menu-model';
import { SharedService } from '../../services/shared.service';
import { SessionStorageService } from '../../services/session-storage.service';
import { SessionKeys } from '../../models/common/login-model';
import { LoaderService } from '../../services/loader.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UtilityService } from '../../services/utility.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CdkOverlayOrigin, OverlayModule } from "@angular/cdk/overlay";
import { LegacyComponentService } from '../../services/legacy-component.service';
import { environment } from '../../../environments/environment';
import { TruncatePipe } from '../../shared/pipe/truncate.pipe';

@Component({
  selector: 'eclipse-nav-bar',
  standalone: true,
  imports: [TruncatePipe, TooltipModule , OverlayModule, CommonModule, IconModule, TabModule, MenuModule, ItemModule, DropDownModule, SubMenuComponent, HttpClientModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit, OnDestroy {

  leftNavMenuItems: string[] = [MenuKeys.INSTRUCTIONS, MenuKeys.MADRAS, MenuKeys.REFERENTIAL, MenuKeys.DATASCOPES, MenuKeys.DATA_MAINTENANCE, MenuKeys.FOLLOW_UP];
  rightNavMenuItems: string[] = [MenuKeys.DEVELOPMENT, MenuKeys.ADMINISTRATION, MenuKeys.GUIDELINES, MenuKeys.POS, MenuKeys.LANGUAGE];

  externalMenuItems: string[] = [MenuKeys.MADRAS, MenuKeys.REFERENTIAL, MenuKeys.DATASCOPES, MenuKeys.DATA_MAINTENANCE, MenuKeys.FOLLOW_UP, MenuKeys.POS];
  languageMenuItems: string[] = [MenuKeys.LANGUAGE];

  data: Partial<MenuResponse> = {};
  selectedLanguage = 'Language';
  subscription = new Subscription();
  selectedIndices: number[] = [];
  SelectedTitleStack: string[] = [];

  constructor(protected menuService: MenuService, protected sharedService: SharedService, protected sessionStorageService: SessionStorageService,
              protected loaderService: LoaderService, private cookieService: CookieService, private utilService: UtilityService, private _router:Router,
              protected _legacyService: LegacyComponentService)
  {
    const sub = this.sharedService.updateInstMenu$.subscribe((data: SubMenuItem[]) => {
      this.data[MenuKeys.INSTRUCTIONS] = data;
    });
    this.subscription.add(sub);
    this._legacyService.message$.subscribe(() => {
      this.closeDropdown();
      this.resetMenu();
    });
  }

  ngOnInit(): void {
    this.getMenuData();
  }

  public getMenuData() {
    this.loaderService.showLoader();
    const sub = this.menuService.getMenus().subscribe({
      next: (data: MenuResponse) => {
        this.data = data;
        this.setLanguage(this.sessionStorageService.get(SessionKeys.LANGUAGE_CODE));
        this.loaderService.hideLoader();
      },
      error: (error) => {
        this.loaderService.hideLoader();
        this.utilService.openSnackBar(
          'large',
          'error',
          error.error?.error ||
          error.error?.message ||
          error.error?.status?.errors?.[0]?.message ||
          'An unknown error occurred',
          'alert'
        );
      }
    });
    this.subscription.add(sub);
  }


  public getMenuKey(key: string): Extract<keyof MenuResponse, MenuKeys.INSTRUCTIONS | MenuKeys.DEVELOPMENT | MenuKeys.ADMINISTRATION | MenuKeys.GUIDELINES> {
    const menu = (key as MenuKeys) as Extract<keyof MenuResponse, MenuKeys.INSTRUCTIONS | MenuKeys.DEVELOPMENT | MenuKeys.ADMINISTRATION | MenuKeys.GUIDELINES>;
    return menu;
  }

  public redirectToDashboard(){
    this._router.navigateByUrl('/dashboard');
  }

  public redirectToExternal(key: string) {
    const menu = (key as MenuKeys) as keyof MenuResponse;
    const menuItem: ExternalMenuItem = this.data[menu] as ExternalMenuItem;

    if(key === MenuKeys.POS)
      this.navigateFromMenu(menuItem.url);
    else
      window.location.href = menuItem.url;
  }

  public getLanguageMenuItems(key: string): LanguageMenuItem[]{
    const menu = (key as MenuKeys) as keyof MenuResponse;
    return this.data[menu] as LanguageMenuItem[];
  }

  public setLanguage(languageCode: string) {

    const languageItems : LanguageMenuItem[] = this.data[MenuKeys.LANGUAGE] as LanguageMenuItem[];
    const languageItem = languageItems.find(item => item.lanCode === languageCode);
    this.selectedLanguage = languageItem ? languageItem.languageName : 'Language';

    this.sessionStorageService.set(SessionKeys.LANGUAGE_CODE, languageCode);
    this.cookieService.set('eclipse.locale.' + this.sessionStorageService.get(SessionKeys.USER_NAME), languageCode, 10, "/");
    this.closeDropdown();
    this.resetMenu();
  }

  currentMenu: MenuItem[] = [];
  currentLanguageMenu: LanguageMenuItem[] = [];
  menuStack: MenuItem[][] = [];
  selectedMenuTitle = 'Main Menu';
  isDropdownOpen = false;
  isLanguageMenu = false;
  activeIndex = 0; // For keyboard navigation
  dynamicSelectedTab!: CdkOverlayOrigin;

  openMainMenu(navMenuItem: string, button: CdkOverlayOrigin): void {
    this.selectedIndices = [];
    this.isLanguageMenu = false;
    this.currentMenu = [];
    this.menuStack = [];
    this.SelectedTitleStack = [];
    this.selectedMenuTitle = 'Main Menu';

    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.dynamicSelectedTab = button;
    const relayValue = this.getMenuKey(navMenuItem)
    this.currentMenu = this.data[relayValue] || [];
    if (navMenuItem === MenuKeys.LANGUAGE) {
      this.currentLanguageMenu = this.getLanguageMenuItems(navMenuItem) || [];
      this.isLanguageMenu = true;
    }
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.menuStack = [];
    this.currentMenu = [];
    this.selectedMenuTitle = 'Main Menu';
    this.isLanguageMenu = false;
    this.selectedIndices = [];
    this.SelectedTitleStack = [];
  }

  openSubmenu(item: MenuItem, index: number): void {
    this.selectedIndices.push(index);
    if (item.children) {
      this.menuStack.push(this.currentMenu);
      this.SelectedTitleStack.push(this.selectedMenuTitle);
      this.currentMenu = item.children;
      this.selectedMenuTitle = item.menuItemName; // Show selected menu as heading
      this.activeIndex = 0;
    }
  }

  goBack(): void {
    if (this.menuStack.length > 0) {
      this.currentMenu = this.menuStack.pop()!;
      this.selectedMenuTitle = this.menuStack.length > 0 ? this.SelectedTitleStack.length > 0 ? this.SelectedTitleStack[this.SelectedTitleStack.length - 1] : 'Main Menu': 'Main Menu';
      this.activeIndex = 0;
    }
  }

  // Handle keyboard navigation
  @HostListener('document:keydown', ['$event'])
  navigate(event: KeyboardEvent): void {

  if (!this.isDropdownOpen) return;

  switch (event.key) {
    case 'ArrowDown':
      this.activeIndex = (this.activeIndex + 1) % this.currentMenu.length;
      break;
    case 'ArrowUp':
      this.activeIndex = (this.activeIndex - 1 + this.currentMenu.length) % this.currentMenu.length;
      break;
    case 'ArrowRight':
    case 'Enter':
      if (this.currentMenu[this.activeIndex]?.children) {
        this.openSubmenu(this.currentMenu[this.activeIndex], this.activeIndex);
      }
      break;
    case 'ArrowLeft':
      this.goBack();
      break;
    case 'Escape':
      this.isDropdownOpen = false;
      this.resetMenu();
      break;
  }
  }

  // Reset menu to main
  resetMenu(): void {
    this.currentMenu = [];
    this.menuStack = [];
    this.activeIndex = 0;
    this.isLanguageMenu = false;
    this.selectedMenuTitle = 'Main Menu';
    this.selectedIndices = [];
    this.SelectedTitleStack = [];
  }


  navigate1(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        this.activeIndex = (this.activeIndex + 1) % this.currentMenu.length;
        break;
      case 'ArrowUp':
        this.activeIndex = (this.activeIndex - 1 + this.currentMenu.length) % this.currentMenu.length;
        break;
      case 'Enter':
      case 'ArrowRight':
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeyboard(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeDropdown();
    }
  }

  navigateFromMenu(URL:string){
    this.closeDropdown();
    this.resetMenu();

    if(URL.includes("nielsenenterprise"))
      {      
        window.open(URL, '_blank');
      }
   else if (URL.includes(".action")) {
      this._legacyService.legacyUrl.next(`${environment.kawaURL}${URL}`);
      this._router.navigateByUrl('/legacy', {state: {src: `${environment.kawaURL}${URL}`}});
    }
    else{
      this._router.navigate([URL]);
    }
    
  }

  public userLogout(_event: Event) {
    this.loaderService.showLoader();
    this.sharedService.userLogout();
    this.loaderService.hideLoader();    
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

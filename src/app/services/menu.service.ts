import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MenuResponse, MenuResponseMap, MenuKeys, SubMenuItem, ExternalMenuItem, LanguageMenuItem } from '../models/common/menu-model';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  MENU_RESPONSE_MAP: MenuResponseMap = {
    subMenuType: [MenuKeys.INSTRUCTIONS, MenuKeys.DEVELOPMENT, MenuKeys.ADMINISTRATION, MenuKeys.GUIDELINES],
    nonSubMenuType: [MenuKeys.LANGUAGE],
    hrefMenuType: [MenuKeys.MADRAS, MenuKeys.REFERENTIAL, MenuKeys.DATASCOPES, MenuKeys.DATA_MAINTENANCE, MenuKeys.FOLLOW_UP, MenuKeys.POS]
  };

  menuNameWithURLMapping: Record<string, string> = {
    "Resolution by User": "follow-up/resolution-by-user",
    "Overall Initialisation": "follow-up/overall-initialisation",
    "Product Mapped Char Resolution": "follow-up/product-mapped-char-resolution",
    "Product Mapped Char Rule Generation": "follow-up/product-mapped-char-rule-generation",
    "Product Mapped Char Rule Generation by POS": "follow-up/product-mapped-char-rule-generation-by-pos",
    "Product Segment Resolution": "follow-up/product-segment-resolution",
    "Mapped Conversion Resolution": "follow-up/mapped-conversation-resolution",
    "Product Hierarchy Generation": "follow-up/product-hierarchy-generation",
    "Product Output Set Resolution": "follow-up/product-output-set-resolution",
    "Rule Induction": "follow-up/rule-induction"
  }

  constructor(private _http: HttpClient) { }

  getMenus(): Observable<MenuResponse> {
    return this._http.get<any>(`${environment.eclipseURL}application-menu/all-menu`, { withCredentials: true }).pipe(
      map(response => this.parseMenuResponse(response))
    );

  }

  getInstructionMenu(): Observable<SubMenuItem[]> {
    return this._http.get<any>(`${environment.eclipseURL}application-menu/all-menu`, { withCredentials: true }).pipe(
      map(response => this.parseSubMenuStructure(response.body[MenuKeys.INSTRUCTIONS]))
    );

  }

  private parseMenuResponse(response: any): MenuResponse {
    const result: any = {};

    Object.keys(response.body).forEach(key => {
      if (this.MENU_RESPONSE_MAP.subMenuType.includes(key)) {
        result[key] = this.parseSubMenuStructure(response.body[key]);
      } else if (this.MENU_RESPONSE_MAP.nonSubMenuType.includes(key)) {
        result[key] = this.parseNonSubMenuTypeStructure(response.body[key]);
      } else if (this.MENU_RESPONSE_MAP.hrefMenuType.includes(key)) {
        result[key] = this.parseHrefMenuStructure(response.body[key]);
      }
    });
    return result as MenuResponse;
  }

  private parseSubMenuStructure(data: any): SubMenuItem[] {
    const menuItems: SubMenuItem[] = [];

    Object.entries(data).forEach(([key, value]) => {
      const menuItem: SubMenuItem = { menuItemName: key, url: '' };

      if (typeof value === "object" && value !== null) {
        menuItem.children = this.parseSubMenuStructure(value);
      }
      else {
        menuItem.url = this.menuNameWithURLMapping[key] ? this.menuNameWithURLMapping[key] : value as string;
      }
      menuItems.push(menuItem);
    });

    return menuItems;
  }

  private parseNonSubMenuTypeStructure(data: any): LanguageMenuItem[] {

    const languageMenuItems: LanguageMenuItem[] = [];

    Object.entries(data).forEach(([key, value]) => {
      const langData = value as { URL: string; LanCode: string };
      languageMenuItems.push({
        languageName: key,
        url: langData.URL,
        lanCode: langData.LanCode
      });
    });

    return languageMenuItems;
  }

  private parseHrefMenuStructure(data: any): ExternalMenuItem {
    return { url: data };
  }
}

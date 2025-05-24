import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuModule, ItemModule } from '@nielseniq/athena-core';
import { SubMenuItem, LanguageMenuItem } from '../../models/common/menu-model';
import { Router } from '@angular/router';

@Component({
  selector: 'eclipse-sub-menu',
  standalone: true,
  imports: [MenuModule, ItemModule],
  templateUrl: './sub-menu.component.html',
  styleUrl: './sub-menu.component.css'
})
export class SubMenuComponent {
  @Output() languageSelected = new EventEmitter<string>();
  @Input() subMenuItems: SubMenuItem[] =[];
  @Input() languageMenuItems: LanguageMenuItem[] =[];

  constructor(private router:Router){}

  navigateFromMenu(URL:string){
    this.router.navigate([URL]);
  }

  selectLanguage(languageName: string) {
    this.languageSelected.emit(languageName);
  }
}

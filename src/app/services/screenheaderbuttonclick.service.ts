import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScreenheaderbuttonclickService {

  public headerActionClick = new EventEmitter<string>();
  public listActionClick = new EventEmitter<string>();

  emitHeaderActionClick(actionName:string){
    this.headerActionClick.emit(actionName);
  }

  emitListActionClick(actionName:string,rowData:object) {
    this.listActionClick.emit(JSON.stringify({'actionName':actionName,'rowData':rowData}));
  }
}

import { Injectable } from '@angular/core';
import { ToastService, ToastState } from '@nielseniq/athena-core';
import { environment } from '../../environments/environment';
import { SnackbarModule, SnackbarService, SnackbarSize, SnackbarState } from '@nielseniq/athena-core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  
  isLoading = false;
  constructor(private snackbarService: SnackbarService) {}

  /**
   * Used to show messages
   * @param size @typedef SnackbarSize
   * @param type @typedef SnackbarState
   * @param message @type string
   * @param iconName @type string
   */
  openSnackBar(size: SnackbarSize, type: SnackbarState, message: string, iconName: string) {
    this.snackbarService.open(size, type, message, iconName, {dismissAfter : 5000});
  }

  getImagePath() {
    return environment.imageBasePath;
  }

  getIllustrationImage() {
    return environment.imageBasePath+"images/Illustration_Restricted.png";
  }

  keyMapping(columnName: string): string {
    if (columnName.split(" ").length > 1) {
      columnName = columnName.replace(" ", "_");
    }
    columnName = columnName.toLocaleLowerCase();
    return columnName;
  }
}

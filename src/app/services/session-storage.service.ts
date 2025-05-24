import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  key = environment.encryptKey; // key for encryption and decryption

  constructor() {

  }

  encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data.toString(), this.key).toString();
  }

  decryptData(data: any): string {
    return CryptoJS.AES.decrypt(data.toString(), this.key).toString(
      CryptoJS.enc.Utf8
    );
  }

  public set(key: string, value: any) {
    // if the value is not empty, encrypt and store in local
    if (value !== '') {
      // sessionStorage.setItem(key, this.encryptData(value));
      sessionStorage.setItem(key, this.encryptData(value));
    }
    // else, store as it is
    else {
      sessionStorage.setItem(key, value);
    }
  }

  public get(key: string): any {
    // if the value for the corresponding key is empty, return as it is
    let val = sessionStorage.getItem(key);
    // console.log("val::", val, "key::", key);
    // console.log("key::", key);
    if (val === '' || val === null) return val;
    // else, decrypt and return
    else {
      return this.decryptData(val);
    }
  }
  
  public clear(){
    sessionStorage.clear();
  }

}

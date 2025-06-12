import { Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
    private isBrowser: boolean;

    constructor(
        @Inject(PLATFORM_ID) private platformId: object, 
        @Inject(DOCUMENT) private document: Document) {
      this.isBrowser = isPlatformBrowser(this.platformId);
    }

    setCookie(name: string, value: string, days: number): void {
        if (this.isBrowser) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "expires=" + date.toUTCString();
            // this.document.cookie = name + "=" + value + ";" + expires + ";path=/";
            this.document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;Secure`;
        }
    }

    getCookie(name: string): string | null {
        if (this.isBrowser) {
            const nameEQ = name + "=";
            const ca = this.document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    deleteCookie(name: string): void {
        if (this.isBrowser) {
            this.setCookie(name, "", -1);
        }
    }
}

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NavDataStore {
   companyName = signal('Test Company');
   companyLogoURL = signal('images/default-company.png');

  setCompanyInfo(name: string, logoUrl: string) {
    this.companyName.set(name);
    this.companyLogoURL.set(logoUrl);
  }
}

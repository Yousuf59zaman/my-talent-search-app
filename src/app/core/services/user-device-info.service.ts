import { Injectable } from '@angular/core';

export interface UserDeviceInfo {
  ipAddress?: string;
  macAddress?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  };
  operatingSystem?: string;
  ram?: string;
  screenSize?: string;
  bandwidth?: string;
  browser?: string;
  device?: number;
  date?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserDeviceInfoService {
  private info: UserDeviceInfo = {};

  constructor() {
    this.info.date = new Date().toISOString();
    this.info.screenSize = `${window.screen.width}x${window.screen.height}`;
    this.info.browser = this.getBrowserInfo();
    this.info.operatingSystem = this.getOSInfo();
    this.info.device = this.getDeviceType();
    this.info.ram = this.getRAM();
    this.getLocation();
    this.getBandwidth();
    this.getIpAddress();
    // Mac address is not accessible from browser JS for security reasons
  }

  getUserDeviceInfo(): UserDeviceInfo {
    return this.info;
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident/') > -1) return 'IE';
    return 'Unknown';
  }

  private getOSInfo(): string {
    const platform = navigator.platform.toLowerCase();
    if (platform.indexOf('win') > -1) return 'Windows';
    if (platform.indexOf('mac') > -1) return 'MacOS';
    if (platform.indexOf('linux') > -1) return 'Linux';
    if (/android/.test(navigator.userAgent.toLowerCase())) return 'Android';
    if (/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())) return 'iOS';
    return 'Unknown';
  }

  private getDeviceType(): number {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 1;
    if (/tablet/i.test(ua)) return 3;
    return 2;
  }

  private getRAM(): string {
    // navigator.deviceMemory is not supported in all browsers
    // Returns in GB
    // @ts-ignore
    return navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown';
  }

  private getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.info.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        },
        () => {
          this.info.location = {};
        }
      );
    }
  }

  private getBandwidth() {
    // navigator.connection is not supported in all browsers
    // @ts-ignore
    if (navigator.connection && navigator.connection.downlink) {
      // @ts-ignore
      this.info.bandwidth = `${navigator.connection.downlink} Mbps`;
    } else {
      this.info.bandwidth = 'Unknown';
    }
  }

  private getIpAddress() {
    // IP address can only be fetched from a backend or a public API
    fetch('https://api.ipify.org?format=json')
      .then((res) => res.json())
      .then((data) => {
        this.info.ipAddress = data.ip;
      })
      .catch(() => {
        this.info.ipAddress = 'Unknown';
      });
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScriptLoaderService {
  private promises: Record<string, Promise<void> | undefined> = {};

  async loadScript(url: string): Promise<void> {
    if (this.promises[url]) {
      return this.promises[url];
    }

    this.promises[url] = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.body.appendChild(script);
    });

    return this.promises[url];
  }
}

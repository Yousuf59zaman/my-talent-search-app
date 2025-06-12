import { ChangeDetectionStrategy, Component, computed, inject, input, Input, Signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-iFrame-loader',
  standalone: true,
  imports: [],
  template: `
  <div class="h-[550px] w-full">
    <iframe
      [src]="safeUrl()"
      width="100%"
      height="100%"
      frameborder="0"
    ></iframe>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IFrameLoaderComponent {
  private sanitizer = inject(DomSanitizer);
  readonly previewUrl = input('');
  readonly modalTitle = input('');
  public safeUrl: Signal<SafeResourceUrl>  = computed(() => this.sanitizer.bypassSecurityTrustResourceUrl(this.previewUrl()))

}
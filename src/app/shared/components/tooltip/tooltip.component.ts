import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [],
  template: `
    <div class="relative group">
      <span class="icon-help {{iconSizeClass()}}"></span>
      <div
        class="absolute font-normal left-1/2 -translate-x-1/2 bottom-full mb-2 text-center w-52 bg-black text-white border px-2 py-2 text-sm rounded-lg shadow-xl z-[999] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
      >
        <div
          class="absolute -translate-x-1/2 -bottom-2 left-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-black"
        ></div>
        {{ toolText() }}
      </div>
    </div>
  `
})
export class TooltipComponent {
  readonly toolText = input<string>('');
  readonly iconSizeClass = input<string>('');
}

import { NgClass, NgComponentOutlet, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  input,
  Output,
  Type,
  viewChild,
} from '@angular/core';
import { ModalAttributes } from '../../utils/app.const';
import { animate, style, transition, trigger } from '@angular/animations';
export type ModalType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [NgComponentOutlet, NgStyle,NgClass],
  templateUrl: './modal-container.component.html',
  styleUrls: ['./modal-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations:[
    trigger('fadeInBackdrop', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in-out', style({ opacity: 1 })) 
      ]),
      transition(':leave', [
        animate('200ms ease-in-out', style({ opacity: 0 })) 
      ])
    ]),
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-in-out', style({ opacity: 1, transform: 'scale(1)' })) 
      ]),
      transition(':leave', [
        animate('150ms ease-in-out', style({ opacity: 0, transform: 'scale(0.9)' })) 
      ])
    ])
  
  ]
})
export class ModalContainerWoPComponent {
  componentRef = input<Type<any>>(null as unknown as Type<any>);
  attributes = input<Record<string, string | boolean>>(ModalAttributes);
  inputs = input<Record<string, any>>({});
  isClose = input<boolean>(false);
  isHideScroll = computed(() => this.attributes()['isHideScroll'] );
  modalWidth = computed(() => {
    if (this.attributes()['modalWidth']) {
      return this.attributes()['modalWidth'];
    }
    return '900px';
  });

  @Output() onClose = new EventEmitter<boolean>();
  modalCloseEl = viewChild<ElementRef>('closeElem');

  closeModal() { 
    this.onClose.emit(true);
  }

  constructor() {
    effect(() => {
      if (this.isClose()) {
        this.modalCloseEl()?.nativeElement.click();
      }
    });
  }
}

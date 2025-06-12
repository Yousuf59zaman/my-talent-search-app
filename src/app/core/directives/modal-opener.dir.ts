import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnChanges,
  SimpleChanges,
  Type,
} from '@angular/core';
import { ModalService } from '../services/modal/modal.service';

@Directive({
  selector: '[modalAttributes]',
  standalone: true,
})
export class ModalOpenerDirective implements OnChanges {
  @Input() modalAttributes: Record<string, string | boolean> = {};
  @Input() compRef: Type<any> = null as any;
  @Input() compInput!: Record<string, any>;
  private modalService = inject(ModalService);
  private el = inject(ElementRef);

  @HostListener('click')
  onClick() {
    if (this.compRef) {
      // this.modalService.setModalConfigs({
      //   componentRef: this.compRef,
      //   attributes: this.modalAttributes,
      //   inputs: this.compInput
      // });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modalAttributes']) {
      const element = this.el.nativeElement;
      Object.keys(this.modalAttributes).forEach((attr) => {
        if (attr !== 'id') {
          element.setAttribute(attr, this.modalAttributes[attr].toString());
        }
      });
    }
    if (this.compRef) {
      this.modalService.setModalConfigs({
        componentRef: this.compRef,
        attributes: this.modalAttributes,
        inputs: this.compInput,
      });
    }
  }
}

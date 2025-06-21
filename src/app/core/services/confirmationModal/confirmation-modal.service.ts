import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, take, tap } from 'rxjs';

export interface ModalConfig {
  isOpen?: boolean;
  event?: {
    isConfirm: boolean
  };
  content?: {
    title?: string;
    isIconeClass?: string
    content: string;
    closeButtonText: string;
    saveButtonText: string;
    linkText?: string; // Add link text
    linkUrl?: string;  // Add link URL
    isIcon: boolean;
    isCloseButtonVisible: boolean;
    isSaveButtonVisible: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationModalService {

  modalConfigSubject = new BehaviorSubject<ModalConfig>({
    isOpen: false,
    content: {
      title: '',
      isIconeClass: '',
      content: '',
      closeButtonText: '',
      saveButtonText: '',
      linkText: '', // Add link text
      linkUrl: '',  // Add link URL
      isIcon: true,
      isCloseButtonVisible: true,
      isSaveButtonVisible: true
    }
  });
  modalConfig$ = this.modalConfigSubject.asObservable();

  openModal(config: ModalConfig) {
    this.modalConfigSubject.next({
      ...this.modalConfigSubject.value,
      ...config,
      isOpen: true
    });

    return this.modalConfig$.
      pipe(
        filter((res) => res.hasOwnProperty('event')),
        take(1),
        tap(() => this.modalConfigSubject.next({ isOpen: false }))
      );
  }

  closeModal() {
    this.modalConfigSubject.next({
      ...this.modalConfigSubject.value, isOpen: false
    });
  }

}

import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, model } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { ConfirmationModalService } from '../../../core/services/confirmationModal/confirmation-modal.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [NgClass, AsyncPipe],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmationModalComponent {
  isOpen = model(false);
  @Output() saveAction = new EventEmitter<boolean>();
  @Output() closeModal = new EventEmitter<boolean>();
  
  private confirmationModalService = inject(ConfirmationModalService);

  modalConfig$ = this.confirmationModalService.modalConfig$.pipe(
    tap((res) => this.isOpen.update(() => res.isOpen || false))
  )

  toggleModal(isYes?: boolean) {
    this.isOpen.update(() => !this.isOpen);
    if (!this.isOpen()) {
      this.closeModal.emit(false);
    }
    if (!isYes) {
      this.confirmationModalService.modalConfigSubject.next({event: {isConfirm: false}})
    }
  }

  saveChanges() {
    this.confirmationModalService.modalConfigSubject.next({event: {isConfirm: true}})
    this.toggleModal(true);
  }
}
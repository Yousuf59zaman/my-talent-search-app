import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { IsCorporateUser } from '../../../shared/enums/app.enums';
import { filter } from 'rxjs';
import { ModalService } from '../../../core/services/modal/modal.service';

@Component({
  selector: 'app-company-verify-modal',
  imports: [],
  templateUrl: './company-verify-modal.component.html',
  styleUrl: './company-verify-modal.component.scss'
})
export class CompanyVerifyModalComponent {
  IsCorporateUser = signal(false);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);

  ngOnInit() {
    const value = localStorage.getItem(IsCorporateUser);
    this.IsCorporateUser.set(value === 'true');
    if (!this.IsCorporateUser()) {
      this.listenOnModalClose();
    }
  }
  
  redirectToDashboard() {
    if (this.IsCorporateUser()) {
      this.authService.redirectToRecruiterDashboard()
    } else {
      this.authService.redirectToBdjobs();
    }
  }

  private listenOnModalClose(): void {
    this.modalService.onCloseModal$
      .pipe( 
        filter((isClose) => isClose) 
      )
      .subscribe({
        next:() => this.authService.redirectToBdjobs()
      });
  }
}

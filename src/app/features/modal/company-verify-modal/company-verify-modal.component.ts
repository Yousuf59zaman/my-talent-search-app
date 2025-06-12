import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth.service';
import { IsCorporateUser } from '../../../shared/enums/app.enums';

@Component({
  selector: 'app-company-verify-modal',
  imports: [],
  templateUrl: './company-verify-modal.component.html',
  styleUrl: './company-verify-modal.component.scss'
})
export class CompanyVerifyModalComponent {
  IsCorporateUser = signal(false);
  private authService = inject(AuthService);
  ngOnInit() {
    const value = localStorage.getItem(IsCorporateUser);
    this.IsCorporateUser.set(value === 'true');
  }
  redirectToDashboard() {
    if (this.IsCorporateUser()) {
      this.authService.redirectToRecruiterDashboard()
    } else {
      this.authService.redirectToBdjobs();
    }
  }
}

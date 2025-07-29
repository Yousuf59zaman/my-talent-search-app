import { AfterViewInit, Component, computed, DestroyRef, inject, input, model, signal } from '@angular/core';
import { IFrameLoaderComponent } from "../iFrame-loader/iFrame-loader.component";
import { ToastrService } from 'ngx-toastr';
import { VideoCvView } from '../../../features/applicant/class/video-cv-view';
import { Applicant } from '../../../features/applicant/models/applicant.model';
import { ApplicantCardService } from '../../../features/applicant/services/applicant-card.service';
import { VideoCvdetailsComponent } from '../../../features/applicant/video-cvdetails/video-cvdetails.component';
import { DownloadCVRequest } from '../../../features/applicant/class/card-query-builder';
import { downloadCustomizedCV } from '../../../shared/utils/functions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';
import { IsCorporateUser } from '../../enums/app.enums';
import { NavDataService } from '../../../core/services/nav-data.service';

@Component({
  selector: 'app-move-to-activity-header',
  imports: [IFrameLoaderComponent, VideoCvdetailsComponent],
  templateUrl: './move-to-activity-header.component.html',
  styleUrl: './move-to-activity-header.component.scss'
})
export class MoveToActivityHeaderComponent extends VideoCvView implements AfterViewInit {
  isVideoAvailable = signal(true);
  applicant = model<Applicant>();
  modalTitle = model('');
  contentType = model<'video-cv-details' | 'cv-details'>('cv-details');
  readonly cvType = input('');
  readonly jobId = input(0);
  readonly applyId = input(0);
  readonly email = input('');
  readonly mobile = input('');
  readonly applicantName = input('');
  readonly photo = input('');
  readonly jobInfo = input('');
  readonly previewUrl = input('');
  readonly isPurchased = input(0);
  readonly isBlueCollarCat = input(0);
  readonly videoUrl = input('');
  readonly serviceId = input(0);
  readonly encrpID = input('');
  readonly startFromSecondVideo = input(false);
  cvDetails = '';

  public destroyRef = inject(DestroyRef);
  private toastr = inject(ToastrService);
  private applicantCardService = inject(ApplicantCardService);
  private localStorageService = inject(LocalstorageService);
  private navDataService = inject(NavDataService);
  
  CvBankSearchAccess = computed(() => this.navDataService.navData()?.cvSearchAccess === true);
  
  isCorporateUser = computed(() => this.localStorageService.getItem(IsCorporateUser) === 'true');

  ngAfterViewInit(): void { }

  switchCvMode(switchToType: 'video-cv-details' | 'cv-details') {
    this.contentType.update(() => switchToType);
    this.modalTitle.update(() => switchToType === 'cv-details' ? "CV Details" : "Video CV Details");
  }

  downloadCustomizedCV() {
    const payload: DownloadCVRequest = {
      hFileName: this.applicantName(),
      hID: this.encrpID(),
      userId: '',
      decodeid: '',
      deviceType: 'web'
    };

    this.applicantCardService
      .downloadCV(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => { })
      )
      .subscribe({
        next: (res) => {
          if (res.status === 0) {
            downloadCustomizedCV(this.applicantName(), res);
          }
        },
        error: (err) => {
          this.toastr.error('Failed to download CV', 'Error');
        }
      });
  }
}



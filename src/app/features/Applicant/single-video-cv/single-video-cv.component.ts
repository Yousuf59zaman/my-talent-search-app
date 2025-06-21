import { IsCorporateUser } from './../../../shared/enums/app.enums';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, model, signal, OnInit, AfterViewInit, Input, computed } from '@angular/core';
import { Applicant, Video, VideoResponse } from '../models/applicant.model';
import { VideoPlayerComponent } from "../../../shared/components/video-player/video-player.component";
import { VideoCvView } from '../class/video-cv-view';
import { VideoConfig, VideoPlayerService } from '../../../shared/services/video-player.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalService } from '../../../core/services/modal/modal.service';
import { ModalAttributes } from '../../../shared/utils/app.const';
import { ApplicantCardService } from '../services/applicant-card.service';
import { MoveToActivityHeaderComponent } from '../../../shared/components/move-to-activity-header/move-to-activity-header.component';
import { ApiResponse } from '../../../shared/models/response';
import { filter, map, of, delay } from 'rxjs';
import { ResponseCode } from '../../../shared/enums/app.enums';
import { NavDataService } from '../../../core/services/nav-data.service';
import { VideoCvdetailsComponent } from '../video-cvdetails/video-cvdetails.component';
import { ApplicantCard } from '../class/applicant-helper';
import { LocalstorageService } from '../../../core/services/essentials/localstorage.service';

@Component({
  selector: 'app-single-video-cv',
  standalone: true,
  imports: [VideoPlayerComponent],
  templateUrl: './single-video-cv.component.html',
  styleUrl: './single-video-cv.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SingleVideoCVComponent extends VideoCvView implements OnInit, AfterViewInit {
  videoEnded: boolean = false;
  selectedVideo = signal<VideoConfig | null>(null);
  videoConfig: VideoConfig[] = [];
  private accplicantCardService = inject(ApplicantCardService);
  public destroyRef = inject(DestroyRef);
  private videoPlayerService= inject(VideoPlayerService)
  private modalService = inject(ModalService);
  private localStorageService = inject(LocalstorageService);
  attributes = ModalAttributes;
  noVideo = signal(false);
  @Input() isPurchased = 0;
  @Input() serviceId = 0;
  readonly jobId = input(0);
  @Input() applyId = 0;
  readonly modalTitle = input('');
  readonly email = input('');
  readonly mobile = input('');
  readonly applicantName = input('');
  readonly photo = input('');
  readonly cvType = input('');
  readonly jobInfo = input('');
  contentType = model<'video-cv-details' | 'cv-details'>('cv-details');
  readonly previewUrl = input('');
  readonly applicant = input<Applicant | null>(null);
  private navDataService = inject(NavDataService);
  cvDetailsLink: string = '';
  salesPersonData = computed(() => this.navDataService.navData());
  isCorporateUser = computed(() => this.localStorageService.getItem(IsCorporateUser) === 'true');
  
  
  ngOnInit(): void {
    this.getVideoCVDetails();
  }
  
  ngAfterViewInit(): void {
    this.videoPlayerService.getVideoEnded()
    .pipe(
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe((videoEnded) => {
      if (videoEnded) {
        this.videoEnded = true;
        this.selectedVideo.set(null);
      }
    });
  }

   getVideoCVDetails() {

    this.accplicantCardService
      .getvideoCVDetails(
        this.applyId.toString(),
        this.serviceId,
        this.isPurchased
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((res) => res.responseCode === ResponseCode.success),
        map((res: ApiResponse<VideoResponse>) => res?.data?.videos[0])
      )
      .subscribe({
        next: (video) => this.playVideo(video as Video)
      });
  }

  private playVideo(video: Video) {
    this.videoEnded = false;
    
    if (!video) {
      this.noVideo.set(true);
      return;
    }
    
    video.answerOn = video.answerOn?.split('T')[0];
    const newConfig: VideoConfig = {
      url: `https://storage.googleapis.com/bdjobs/mybdjobs/videos/cv/${video.sourceURL}`,
      size: 'small',
      shouldPlay: true,
      position: 'left',
    };
    this.selectedVideo.set(newConfig);
  }

  private genCvDetailsLink() {
    return ApplicantCard.getCVDetailsLink(
      this.applicant(),this.isCorporateUser(), this.localStorageService
    );
  }
  
  openVideoCVDetails() {
    const applicant = this.applicant();
    const isPurchasedValue = applicant?.isPurchased || 0;
    const serviceId: number = (this.salesPersonData()?.cvSearchService?.id ?? 0);
    this.cvDetailsLink = this.genCvDetailsLink();
    this.modalService.setModalConfigs({
      attributes: {
        modalWidth: '1200px',
      },
      inputs: {  
        modalTitle: 'Video CV',
        jobId: 0,
        previewUrl: this.cvDetailsLink,
        contentType: 'video-cv-details',  
        applyId: this.applyId,
        applicantName: applicant?.applicantName || '',
        serviceId: serviceId,
        isPurchased: isPurchasedValue,
        encrpID: this.applicant()?.EncrpID as string,
        photo: applicant?.photo,
        cvType: applicant?.attachedCV === 1 ? applicant?.resumeType || '' : '',
        mobile: this.mobile(),
        email: this.email(),
        startFromSecondVideo: true, 
      },
      componentRef: MoveToActivityHeaderComponent,
    });
  }
}
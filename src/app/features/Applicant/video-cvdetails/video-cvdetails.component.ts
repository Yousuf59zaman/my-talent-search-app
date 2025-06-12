import { ChangeDetectorRef, Component, computed, DestroyRef, EventEmitter, inject, input, Input, Output, signal, SimpleChanges } from '@angular/core';
import { VideoConfig, VideoPlayerService } from '../../../shared/services/video-player.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ModalService } from '../../../core/services/modal/modal.service';
import { ToastrService } from 'ngx-toastr';
import { CircularLoaderService } from '../../../core/services/circularLoader/circular-loader.service';
import { VideoPlayerComponent } from "../../../shared/components/video-player/video-player.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Video, VideoResponse } from '../models/applicant.model';
import { ApplicantCardService } from '../services/applicant-card.service';

@Component({
  selector: 'app-video-cvdetails',
  standalone: true,
  imports: [VideoPlayerComponent, CommonModule, FormsModule],
  templateUrl: './video-cvdetails.component.html',
  styleUrl: './video-cvdetails.component.scss'
})
export class VideoCvdetailsComponent {
  @Input() jobId = 0;
  @Input() applyId = 0;
  @Input() email = '';
  @Input() mobile = '';
  @Input() applicantName = '';
  @Input() photo = '';
  @Input() jobInfo = '';
  @Input() isPurchased = 0;
  @Input() serviceId = 0;
  readonly startFromSecondVideo = input(false);

  @Output() isVideoAvailable: EventEmitter<boolean> = new EventEmitter<boolean>();

  videoConfig: VideoConfig[] = [];
  accplicantCardService = inject(ApplicantCardService);
  private destroyRef = inject(DestroyRef);
  private videoService = inject(VideoPlayerService);
  private cdr = inject(ChangeDetectorRef);
  private modalService = inject(ModalService);
  private toastr = inject(ToastrService);
  private loadr = inject(CircularLoaderService);

  selectedVideo = signal<VideoConfig | null>(null);
  loadingState = signal<'initial' | 'loading' | 'done'>('initial');

  allVideo = signal<Video[]>([]);
  videoResponse = signal<VideoResponse>({} as VideoResponse);
  rating = [5, 4, 3, 2, 1];
  totalRating = signal<number>(0);
  ratedByCount = signal<number>(0);
  thisUserRating = signal<number>(0);
  avgRating = computed(
    () => {
      if (this.ratedByCount() > 0) {
        const avg = this.totalRating() / this.ratedByCount();
        if (avg >= (Math.floor(avg) + 0.5)) return Math.ceil(avg);
        return Math.floor(avg);
      };
      return this.totalRating();
    }
  );

  ngOnInit(): void {
    this.getVideoCVDetails();
  }

  getVideoCVDetails() {
    this.loadingState.update(() => 'loading');
    
    this.accplicantCardService
      .getvideoCVDetails(
        this.applyId.toString(),
        this.serviceId,
        this.isPurchased
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingState.update(() => 'done'))
      )
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.videoResponse.update(() => res.data || {} as VideoResponse);
            this.updateRatingData();
            if (Array.isArray(this.videoResponse().videos)) {
              this.playVideosInSequence(this.videoResponse().videos);
            }
          }
        },
        error: (err) => {
          console.error('Error loading video CV details:', err);
          this.isVideoAvailable.emit(false);
        }
      });
  }

  updateRatingData() {
    this.totalRating.update(() => this.videoResponse().totalRating);
    this.ratedByCount.update(() => this.videoResponse().ratedBy);
    this.thisUserRating.update(() => this.videoResponse().thisUserRating);
  }

  getRatingData(rating: number) {
    this.loadr.setLoading(true);
    this.thisUserRating.set(rating);
    this.setOrUpdateRatingData();
  }

  setOrUpdateRatingData() {
    this.accplicantCardService.insertOrUpdateRating(this.applyId.toString(), this.thisUserRating())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadr.setLoading(false))
      )
      .subscribe({
        next: (response) => {
          if (response.data) {
            // Refresh video data to get updated ratings
            this.getVideoCVDetails();
            this.toastr.success('Rating Updated.', 'Success');
          }
        },
        error: (err) => {
          this.toastr.error('Failed to update rating.', 'Error');
          if (err.error && err.error.errors) {
            console.error('Validation errors:', err.error.errors);
          }
        }
      });
  }

  playVideosInSequence(videos: Video[]) {
    this.allVideo.update(() => videos.map((video) => {
      video.answerOn = video.answerOn ? video.answerOn.split('T')[0] : '';
      return video;
    }));

    this.isVideoAvailable.emit(this.allVideo().length > 0);

    const startIndex = this.startFromSecondVideo() && videos.length > 1 ? 1 : 0;

    this.videoConfig = [];
    videos.forEach((video, i) => {
      const newConfig: VideoConfig = {
        url: `https://storage.googleapis.com/bdjobs/mybdjobs/videos/cv/${video.sourceURL}`,
        size: 'small',
        shouldPlay: i === startIndex, 
        position: 'left', 
      };
      this.videoConfig.push(newConfig);
      if (i === startIndex) {
        this.selectedVideo.set(newConfig);
      }
    });

    this.cdr.detectChanges();
  }

  selectVideo(video: Video) {
    if (this.selectedVideo()) {
      this.videoService.resetVideoPlayerStatus();
    }
    
    const newConfig: VideoConfig = {
      url: `https://storage.googleapis.com/bdjobs/mybdjobs/videos/cv/${video.sourceURL}`,
      size: 'small',
      shouldPlay: true,
      position: 'left'  
    };
    this.selectedVideo.set(newConfig);
    this.updateVideo(newConfig);
    this.cdr.detectChanges();
  }
  updateVideo(newConfig: VideoConfig) {
    this.videoService.updateVideoConfig(newConfig);
  }

  closeModal(): void {
    this.modalService.closeModal();
  }
}

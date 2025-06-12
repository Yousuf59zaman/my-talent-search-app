import { Component, DestroyRef, inject, Input, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { VgApiService, VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { VideoConfig, VideoPlayerService } from '../../services/video-player.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    CommonModule
  ],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements  OnInit,OnChanges {
  isValidSource=signal<boolean>(false);
  videoType: 'video/mp4' | 'video/webm' = 'video/mp4';
  preload: string = 'auto';
  api: VgApiService = new VgApiService();
  @Input() videoSource='';
  @Input() playerSize:'large' | 'medium' | 'small' = 'small'; 
  @Input() shouldPlay: boolean = false;
  @Input() position: 'left' | 'center' | 'right' = 'center';
  private videoPlayerService= inject(VideoPlayerService)
  private destroyRef = inject(DestroyRef);
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['videoSource'] && !changes['videoSource'].firstChange) {
      setTimeout(() => this.loadVideoSource(), 0);
    }
    if(changes['videoSource'].currentValue.includes('https://storage.googleapis.com/bdjobs/mybdjobs/videos/cv/https://storage.googleapis.com/bdjobs/mybdjobs/videos/cv/')){
      this.isValidSource.update(() => true);
    }
  }

  ngOnInit() {}

  onPlayerReady(api: VgApiService) {
    this.api = api;
    if (this.shouldPlay) {
      this.api.getDefaultMedia().subscriptions.loadedData
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.api.getDefaultMedia().play();
      });
      this.api.getDefaultMedia().subscriptions.ended
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        () => {
            this.videoPlayerService.videoEnded.next(true);
        }
    );
    }
  }

  private loadVideoSource() {
    if (this.api) {
      const videoElement = this.api.getDefaultMedia().elem as HTMLVideoElement;
      videoElement.pause();
      videoElement.src = this.videoSource;
      videoElement.load();

      if (this.shouldPlay) {
        this.api.getDefaultMedia().subscriptions.loadedData
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.api.getDefaultMedia().currentTime = 0;
        });
      }
    }
  }
  getContainerStyles() {
    return {
      display: 'flex',
      justifyContent: this.getJustifyContent(),
      alignItems: 'center'
    };
  }

  getPlayerSizeClass(): string {
    switch (this.playerSize) {
      case 'large':
        return 'player-large';
      case 'medium':
        return 'player-medium';
      case 'small':
        return 'player-small';
      default:
        return 'player-small';
    }
  }
  private getJustifyContent() {
    switch (this.position) {
      case 'left':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      default:
        return 'center';
    }
  }

  updateVideo() {
    const newConfig: VideoConfig = {
      url: '', 
      size: 'small', 
      shouldPlay: true,
      position: 'right'
    };

    this.videoPlayerService.updateVideoConfig(newConfig);
  }
}

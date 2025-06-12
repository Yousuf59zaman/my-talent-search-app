import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface VideoConfig {
  url?: string;       
  size?: 'large' | 'medium' | 'small'; 
  shouldPlay?: boolean; 
  position?: 'left' | 'center' | 'right';
}

@Injectable({
  providedIn: 'root'
})


export class VideoPlayerService {
  public videoEnded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  getVideoEnded(): Observable<boolean> {
    return this.videoEnded.asObservable();
  }

  private videoConfigSubject: BehaviorSubject<VideoConfig>;
  constructor() { 
    const initialConfig: VideoConfig = {
      url: '',
      size: 'small',
      shouldPlay: false,
      position: 'left'
    };
    
    this.videoConfigSubject = new BehaviorSubject<VideoConfig>(initialConfig);
  }

  getVideoConfig(): Observable<VideoConfig> {
    return this.videoConfigSubject.asObservable();
  }

  updateVideoConfig(newConfig: VideoConfig) {
    this.videoConfigSubject.next(newConfig);
  }

  resetVideoPlayerStatus() {
    this.videoEnded.next(false);
  }
}

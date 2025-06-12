import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SingleVideoCVComponent } from './single-video-cv.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-host-component',
  template: '<app-single-video-cv [videoUrl]="url" [applicantName]="name"></app-single-video-cv>'
})
class HostComponent {
  url = 'https://example.com/video.mp4';
  name = 'John Doe';
}

describe('SingleVideoCVComponent', () => {
  let component: SingleVideoCVComponent;
  let fixture: ComponentFixture<SingleVideoCVComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SingleVideoCVComponent, HostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SingleVideoCVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render video with the correct URL and applicant name', () => {
    const hostFixture = TestBed.createComponent(HostComponent);
    const hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    
    const video: HTMLVideoElement = hostFixture.nativeElement.querySelector('video');
    const heading: HTMLElement = hostFixture.nativeElement.querySelector('h2');
    
    expect(video.src).toContain('https://example.com/video.mp4');
    expect(heading.textContent).toBe('John Doe');
  });
});
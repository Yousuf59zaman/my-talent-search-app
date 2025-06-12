import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoCvdetailsComponent } from './video-cvdetails.component';

describe('VideoCvdetailsComponent', () => {
  let component: VideoCvdetailsComponent;
  let fixture: ComponentFixture<VideoCvdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoCvdetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoCvdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

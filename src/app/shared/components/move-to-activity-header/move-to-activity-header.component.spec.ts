import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveToActivityHeaderComponent } from './move-to-activity-header.component';

describe('MoveToActivityHeaderComponent', () => {
  let component: MoveToActivityHeaderComponent;
  let fixture: ComponentFixture<MoveToActivityHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoveToActivityHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveToActivityHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

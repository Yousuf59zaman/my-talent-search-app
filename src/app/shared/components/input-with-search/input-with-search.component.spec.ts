import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputWithSearchComponent } from './input-with-search.component';

describe('InputWithSearchComponent', () => {
  let component: InputWithSearchComponent;
  let fixture: ComponentFixture<InputWithSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputWithSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputWithSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

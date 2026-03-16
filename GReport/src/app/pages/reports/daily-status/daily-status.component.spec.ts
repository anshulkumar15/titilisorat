import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyStatusComponent } from './daily-status.component';

describe('DailyStatusComponent', () => {
  let component: DailyStatusComponent;
  let fixture: ComponentFixture<DailyStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DailyStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

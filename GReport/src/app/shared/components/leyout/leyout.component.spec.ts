import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeyoutComponent } from './leyout.component';

describe('LeyoutComponent', () => {
  let component: LeyoutComponent;
  let fixture: ComponentFixture<LeyoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeyoutComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LeyoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

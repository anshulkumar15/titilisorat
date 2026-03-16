import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointRejectedComponent } from './point-rejected.component';

describe('PointRejectedComponent', () => {
  let component: PointRejectedComponent;
  let fixture: ComponentFixture<PointRejectedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PointRejectedComponent]
    });
    fixture = TestBed.createComponent(PointRejectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

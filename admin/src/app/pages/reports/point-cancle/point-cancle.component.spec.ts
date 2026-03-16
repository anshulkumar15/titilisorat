import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointCancleComponent } from './point-cancle.component';

describe('PointCancleComponent', () => {
  let component: PointCancleComponent;
  let fixture: ComponentFixture<PointCancleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PointCancleComponent]
    });
    fixture = TestBed.createComponent(PointCancleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

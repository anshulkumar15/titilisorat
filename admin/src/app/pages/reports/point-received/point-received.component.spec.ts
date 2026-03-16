import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointReceivedComponent } from './point-received.component';

describe('PointReceivedComponent', () => {
  let component: PointReceivedComponent;
  let fixture: ComponentFixture<PointReceivedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PointReceivedComponent]
    });
    fixture = TestBed.createComponent(PointReceivedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

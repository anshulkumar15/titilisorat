import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailReportComponent } from './mail-report.component';

describe('MailReportComponent', () => {
  let component: MailReportComponent;
  let fixture: ComponentFixture<MailReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailReportComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MailReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

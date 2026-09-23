import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular/lazy';

import { ScheduleStudyComponent } from './schedule-study.component';

describe('ScheduleStudyComponent', () => {
  let component: ScheduleStudyComponent;
  let fixture: ComponentFixture<ScheduleStudyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleStudyComponent],
      imports: [IonicModule.forRoot()],
    });

    fixture = TestBed.createComponent(ScheduleStudyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

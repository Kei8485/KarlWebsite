import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular/lazy';

import { AppInputComponent } from './app-input.component';

describe('AppInputComponent', () => {
  let component: AppInputComponent;
  let fixture: ComponentFixture<AppInputComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppInputComponent],
      imports: [IonicModule.forRoot()],
    });

    fixture = TestBed.createComponent(AppInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

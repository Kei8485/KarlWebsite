import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DevPreviewPage } from './dev-preview.page';

describe('DevPreviewPage', () => {
  let component: DevPreviewPage;
  let fixture: ComponentFixture<DevPreviewPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DevPreviewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

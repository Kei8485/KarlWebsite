import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageTopicPage } from './manage-topic.page';

describe('ManageTopicPage', () => {
  let component: ManageTopicPage;
  let fixture: ComponentFixture<ManageTopicPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTopicPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

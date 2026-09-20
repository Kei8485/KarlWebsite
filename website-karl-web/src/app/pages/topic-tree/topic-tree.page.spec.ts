import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicTreePage } from './topic-tree.page';

describe('TopicTreePage', () => {
  let component: TopicTreePage;
  let fixture: ComponentFixture<TopicTreePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TopicTreePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { Planner } from './planner';

describe('Planner', () => {
  let service: Planner;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Planner);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

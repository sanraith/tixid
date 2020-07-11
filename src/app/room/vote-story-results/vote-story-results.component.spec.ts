import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteStoryResultsComponent } from './vote-story-results.component';

describe('VoteStoryResultsComponent', () => {
  let component: VoteStoryResultsComponent;
  let fixture: ComponentFixture<VoteStoryResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteStoryResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteStoryResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

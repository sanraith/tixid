import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VoteStoryComponent } from './vote-story.component';

describe('VoteStoryComponent', () => {
  let component: VoteStoryComponent;
  let fixture: ComponentFixture<VoteStoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VoteStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VoteStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

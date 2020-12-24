import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { StoryTitleComponent } from './story-title.component';

describe('StoryTitleComponent', () => {
  let component: StoryTitleComponent;
  let fixture: ComponentFixture<StoryTitleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ StoryTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoryTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

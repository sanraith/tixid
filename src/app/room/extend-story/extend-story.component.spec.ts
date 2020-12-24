import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExtendStoryComponent } from './extend-story.component';

describe('ExtendStoryComponent', () => {
  let component: ExtendStoryComponent;
  let fixture: ComponentFixture<ExtendStoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ExtendStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtendStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

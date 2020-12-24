import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MakeStoryComponent } from './make-story.component';

describe('MakeStoryComponent', () => {
  let component: MakeStoryComponent;
  let fixture: ComponentFixture<MakeStoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MakeStoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakeStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakeStoryComponent } from './make-story.component';

describe('MakeStoryComponent', () => {
  let component: MakeStoryComponent;
  let fixture: ComponentFixture<MakeStoryComponent>;

  beforeEach(async(() => {
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

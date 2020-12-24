import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreJoinComponent } from './pre-join.component';

describe('PreJoinComponent', () => {
  let component: PreJoinComponent;
  let fixture: ComponentFixture<PreJoinComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PreJoinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreJoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

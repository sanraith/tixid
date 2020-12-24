import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReadyButtonComponent } from './ready-button.component';

describe('ReadyButtonComponent', () => {
  let component: ReadyButtonComponent;
  let fixture: ComponentFixture<ReadyButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReadyButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadyButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

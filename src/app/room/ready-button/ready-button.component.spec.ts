import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadyButtonComponent } from './ready-button.component';

describe('ReadyButtonComponent', () => {
  let component: ReadyButtonComponent;
  let fixture: ComponentFixture<ReadyButtonComponent>;

  beforeEach(async(() => {
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

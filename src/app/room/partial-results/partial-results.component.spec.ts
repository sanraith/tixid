import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartialResultsComponent } from './partial-results.component';

describe('PartialResultsComponent', () => {
  let component: PartialResultsComponent;
  let fixture: ComponentFixture<PartialResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartialResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartialResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

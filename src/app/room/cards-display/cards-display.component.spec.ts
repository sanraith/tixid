import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsDisplayComponent } from './cards-display.component';

describe('CardsDisplayComponent', () => {
  let component: CardsDisplayComponent;
  let fixture: ComponentFixture<CardsDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardsDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardsDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

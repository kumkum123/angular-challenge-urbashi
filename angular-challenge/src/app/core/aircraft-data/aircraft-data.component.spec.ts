import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AircraftDataComponent } from './aircraft-data.component';

describe('AircraftDataComponent', () => {
  let component: AircraftDataComponent;
  let fixture: ComponentFixture<AircraftDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AircraftDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AircraftDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

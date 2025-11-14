import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerRequestsComponent } from './farmer-requests.component';

describe('FarmerRequestsComponent', () => {
  let component: FarmerRequestsComponent;
  let fixture: ComponentFixture<FarmerRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmerRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

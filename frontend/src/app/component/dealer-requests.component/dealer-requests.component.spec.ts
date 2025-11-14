import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealerRequestsComponent } from './dealer-requests.component';

describe('DealerRequestsComponent', () => {
  let component: DealerRequestsComponent;
  let fixture: ComponentFixture<DealerRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DealerRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DealerRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactFloatingComponent } from './contact-floating.component';

describe('ContactFloatingComponent', () => {
  let component: ContactFloatingComponent;
  let fixture: ComponentFixture<ContactFloatingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactFloatingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactFloatingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

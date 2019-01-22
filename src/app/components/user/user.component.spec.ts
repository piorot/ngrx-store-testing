import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

describe('UserComponent Jasmine Spy', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  const testStore = jasmine.createSpyObj('Store', ['select']);
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [{ provide: Store, useValue: testStore }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  });

  it('should present first registration date for registered users', async () => {
    const testDate = '11/11/2011';
    testStore.select.and.returnValue(
      of({ name: 'Peter', registrationDate: testDate })
    );
    fixture.detectChanges();
    expect(component).toBeTruthy();
    await fixture.whenStable();
    const lastRegistration: HTMLElement = fixture.nativeElement.getElementsByClassName(
      'user-since'
    )[0].innerText;
    expect(lastRegistration.toString()).toContain(testDate);
  });

  it('should present alternative text instead of registration date for unregistered users', async () => {
    testStore.select.and.returnValue(of({ name: 'Peter', registrationDate: null }));
    fixture.detectChanges();
    expect(component).toBeTruthy();
    await fixture.whenStable();
    const lastRegistration: HTMLElement = fixture.nativeElement.getElementsByClassName(
      'user-since'
    )[0].innerText;
    expect(lastRegistration.toString()).toContain('user is not yet registered');
  });
});

describe('UserComponent self written mock', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;

  const storeMock = {
    select() {
      return of({ name: 'Peter', registrationDate: '11/11/18' });
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserComponent],
      providers: [
        {
          provide: Store,
          useValue: storeMock
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
  }));



  it('should show first registration date for registered useres', async () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    await fixture.whenStable();
    const lastRegistration: HTMLElement = fixture.nativeElement.getElementsByClassName(
      'user-since'
    )[0].innerText;
    expect(lastRegistration.toString()).toContain('11/11/18');
  });


});


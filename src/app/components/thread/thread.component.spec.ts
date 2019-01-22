import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ThreadComponent } from './thread.component';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';

const testThreadTitle = 'What "S" stands for in "SOLID"';
const testCurrentCategory = { name: 'Design principles in OOP' };

describe('ThreadComponent', () => {
  let component: ThreadComponent;
  let fixture: ComponentFixture<ThreadComponent>;
  const testStore = jasmine.createSpyObj('Store', ['select']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThreadComponent],
      providers: [{ provide: Store, useValue: testStore }]
    }).compileComponents();
    fixture = TestBed.createComponent(ThreadComponent);
    component = fixture.componentInstance;
  }));


  it('should present thread title and category it belongs to', async () => {
    testStore.select.and.returnValues(
      of(testThreadTitle),
      of(testCurrentCategory)
    );
    fixture.detectChanges();
    expect(component).toBeTruthy();
    await fixture.whenStable();
    const threadTitleAndCategory: HTMLElement = fixture.nativeElement.getElementsByClassName(
      'thread-description'
    )[0].innerText;
    expect(threadTitleAndCategory.toString()).toContain(
      `${testThreadTitle} from ${testCurrentCategory.name}`
    );
  });

  it('[withArgs()] should present present thread title and category it belongs to', async () => {
    testStore.select
      .withArgs('thread', 'title')
      .and.returnValue(of(testThreadTitle))
      .withArgs('category')
      .and.returnValue(of(testCurrentCategory));

    fixture.detectChanges();
    expect(component).toBeTruthy();
    await fixture.whenStable();
    const threadTitleAndCategory: HTMLElement = fixture.nativeElement.getElementsByClassName(
      'thread-description'
    )[0].innerText;
    expect(threadTitleAndCategory.toString()).toContain(
      `${testThreadTitle} from ${testCurrentCategory.name}`
    );
  });
});

describe('ThreadComponent store mock', () => {
  let component: ThreadComponent;
  let fixture: ComponentFixture<ThreadComponent>;
  const smartStoreMock = {
    select: (...params) => {
      if (
        params.includes('thread') &&
        params.includes('title') &&
        params.length === 2
      ) {
        return of(testThreadTitle);
      } else if (params.includes('category') && params.length === 1) {
        return of(testCurrentCategory);
      }
    }
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ThreadComponent],
      providers: [{ provide: Store, useValue: smartStoreMock }]
    }).compileComponents();
    fixture = TestBed.createComponent(ThreadComponent);
    component = fixture.componentInstance;
  }));

  it('should show thread title and category it belongs to', async () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    await fixture.whenStable();
    const threadTitleAndCategory: HTMLElement = fixture.nativeElement.getElementsByClassName(
      'thread-description'
    )[0].innerText;
    expect(threadTitleAndCategory.toString()).toContain(
      `${testThreadTitle} from ${testCurrentCategory.name}`
    );
  });
});

[![build status](https://api.travis-ci.org/piorot/ngrx-store-testing.svg)](http://travis-ci.org/piorot/ngrx-store-testing)

<a href="https://medium.com/@rotynski/how-to-test-ngrx-store-dependent-components-in-2019-cb1be3cdd6dd" target="_blank">**Link to medium Article**</a>
# How to test ngrx/store dependent components in Angular 7 applications.

> The following text will discuss different approaches to testing the angular components that use ngrx/store. Using Jasmine’s withArgs() method is available for jasmine version 3.0 users.


## Testing against alternative flows

Let’s imagine ngrx/store user slice of a very simple forum like application.

![Responsiveness](https://cdn-images-1.medium.com/max/2560/1*ObI4wjBV0zDwTdoZDVxeXQ.png)


Notice the conditional presentation of user’s registration date in this dead simple user-component. If the user is registered on the forum than their registration date is fetched on a selection from the store. Otherwise, no registration date is fetched and a static fallback text is used. The component under test is presented on code snippets below.


```javascript
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  public user$: Observable<User>;
  constructor(private store: Store<State>) {}

  ngOnInit() {
    this.user$ = this.store.select('user');
  }
}
```
> user.component.ts


```html
<div *ngIf="user$ | async as user" class="user-info">
  <p class="user-name">Name : {{user.name}}</p>
  <p class="user-since">On forum since : {{user.registrationDate || 'user is not yet registered'}}</p>
</div>
```
> user.component.html

The conditional logic in the template file is what we may want to test.

### a) write your own store mock
One of the possible approaches to testing store dependent component would be to use self-written store mock object.

```javascript
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



  it('should show first registration date for registered users', async () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    await fixture.whenStable();
    const lastRegistration: HTMLElement = fixture.nativeElement.getElementsByClassName(
      'user-since'
    )[0].innerText;
    expect(lastRegistration.toString()).toContain('11/11/18');
  });


});
```
> The custom mock approach

The test above is perfectly fine, but it covers only the first case (registration date is present in store). With this approach to test the second case, we need to create the component once again but this time provide another version of mock that actually returns no registration date. This will probably cause repetition of the whole beforeEach section which is not optimal.

### b) use jasmine’s spy object
Another solution would be to use jasmine’s spy on the select method, provide it when the test module is being configured and then control return value from the test itself.

```javascript
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

  it('should present first registration date for registered useres', async () => {
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
```

Using jasmine spy seems to be the more flexible solution and lets us cover both test cases without necessary hassle and code repetition.

## Testing against multiple selections


![Responsiveness](https://cdn-images-1.medium.com/max/2560/1*ReEyUg1Ryk2znzWZuBUVHA.png)
> Store slices and thread component

The complexity here comes from double selecting different store slices. The component under test is presented on code snippets below.

```javascript
@Component({
  selector: 'app-thread',
  templateUrl: './thread.component.html',
  styleUrls: ['./thread.component.css']
})
export class ThreadComponent implements OnInit {
  threadTitle$: Observable<String>;
  currentCategory$: Observable<Category>;
  constructor(private store: Store<State>) { }

  ngOnInit() {
    this.threadTitle$ = this.store.select('thread', 'title');
    this.currentCategory$ = this.store.select('category');
  }
  
}
```
> thread.component.ts

```html
<div class="thread-description" *ngIf="((currentCategory$ | async) && (threadTitle$ | async))">
  {{threadTitle$ | async}} from {{(currentCategory$ | async).name}}
</div>
```
> thread.component.html

### a) write your own store mock
Below I present one of the possible implementations, of self-written store mock. There are of course other ways to do the same.

```javascript
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
```
> thread.component.spec.ts - own mock

No matter how it is implemented this approach seems to be far from perfect and for more complex components it may get tricky. The conditional logic in mock grows with each new store slice selection. Test suite built around such an approach is hardly extendable.


### b) use jasmine’s spy object
Let’s see jasmine’s spies in action. Spy is created and injected on configure phase and return values are controlled from the single test.

```javascript
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
});
```
> thread.component.spec.ts -jasmine spy object

Again, using jasmine’s spy makes the code cleaner and fancier. Since the assertion strongly relies on return values it makes sense to have it in test code, not in the test suite setup phase. The main drawback here is the tight coupling between the test case and the sequence of calls in the thread component. Whenever component calls sequence changes test suite needs to follow.

### c) use jasmine’s withArgs() method

```javascript
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
```
> thread.component.spec.ts -jasmine withArgs()

This is my personal favorite as there is no invocation dependency here. I like withArgs() that much, that I’ve created PR to add this missing cool feature to typescript typings. Describing jasmine’s spy behavior with the use of withArgs() makes it super readable as we clearly see return values in different invocations from a single test.


## Summary:
From all methods presented above the one powered by jasmine’s spies and withArgs() seems to be the most readable and is surely my personal choice, especially in cases where component relies on multiple selections from a store.

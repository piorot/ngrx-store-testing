[![build status](https://api.travis-ci.org/piorot/ngrx-store-testing.svg)](http://travis-ci.org/piorot/ngrx-store-testing)

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
user.component.ts


```html
<div *ngIf="user$ | async as user" class="user-info">
  <p class="user-name">Name : {{user.name}}</p>
  <p class="user-since">On forum since : {{user.registrationDate || 'user is not yet registered'}}</p>
</div>
```

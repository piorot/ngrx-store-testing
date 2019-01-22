import { State } from './../../store/interfaces';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { User } from '../../store/interfaces';

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

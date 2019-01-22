import { Category } from './../../store/interfaces';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { State } from '../../store/interfaces';

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

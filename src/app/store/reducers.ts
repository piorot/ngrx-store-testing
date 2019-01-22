import { Action } from '@ngrx/store';
import { User, Thread, Category } from './interfaces';

export function userReducer(state = initialUserState, action: Action) {
  switch (action.type) {
    default:
      return state;
  }
}


export function threadReducer(state = initialThreadState, action: Action) {
  switch (action.type) {
    default:
      return state;
  }
}
export function categoryReducer(state = initialCategoryState, action: Action) {
  switch (action.type) {
    default:
      return state;
  }
}


const initialUserState: User = { name: null, registrationDate: null };

const initialThreadState: Thread = {
  title: null,
  description: null
};

const initialCategoryState: Category = {
  name: null,
  description: null
};

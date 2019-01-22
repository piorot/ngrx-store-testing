import { Category } from './interfaces';
export interface User {
  name: string;
  registrationDate: string;
}

export interface Thread {
  title: string;
  description: string;
}

export interface Category {
  name: string;
  description: string;
}

export interface State {
  user: User;
  thread: Thread;
  category: Category;
}

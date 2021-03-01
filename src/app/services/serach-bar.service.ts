import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchBarService {

  searchInput$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor() {
  }

  getSearchInput$(){
      return this.searchInput$;
  }

}

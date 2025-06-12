import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CircularLoaderService {

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loadingState$ = this.loadingSubject.asObservable();

  setLoading(state: boolean) {
    this.loadingSubject.next(state);
  }
}

import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { session, Session } from '../shared/session.model';

@Injectable({
  providedIn: 'root'
})

export class SessionService {

  sessionObservable: Observable<Session>;

  constructor() { }

  public refresh(): void {
    session.set(localStorage.getItem('session'));
  }

  // returns observable that informs subscriber when value for session is set
  public observe(): Observable<Session> {
    if (this.sessionObservable) {
      return this.sessionObservable;
    }
    else {
      return this.sessionObservable = new Observable<Session>(subscriber => {
        if (session.active()) { // instant response if active
          subscriber.next(session);
          subscriber.complete();
        } else {
          const i = interval(5000).subscribe(() => {
            this.refresh();
            if (session.active()) {
              i.unsubscribe();
              subscriber.next(session); // return self
              subscriber.complete();
            }
          });
        }
      });
    }
  }
}

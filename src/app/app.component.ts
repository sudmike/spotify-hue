import { Component } from '@angular/core';
import { SpotifyWebService } from './services/spotify-web.service';
import {CookieService} from 'ngx-cookie-service';
import {interval, Observable, Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'spotify-hue';
  session: string;

  constructor(private spotifyService: SpotifyWebService,
              private cookieService: CookieService) {
    this.session = cookieService.get('session');
  }

  tempRefresh(): void {
    this.spotifyService.refreshAccessToken();
  }

  // check for cookie change after clicking initialization link
  initializeHue(): void {

    if (this.cookieService.check('session')){ // check for session cookie
      this.session = this.cookieService.get('session');
    }

    else {
      const INTERVALTIME = 2500;
      const MAXTIME = 90000;

      window.open('http://localhost:3000/hue/api/hue-login', '_blank');

      const checkingInterval = interval(INTERVALTIME).subscribe(loops => {
        if (this.cookieService.check('session')){ // success (session cookie was set)
          this.session = this.cookieService.get('session');
          // console.log('Hue Initialization was completed!');
          checkingInterval.unsubscribe();
        }
        else if ((loops + 1) * INTERVALTIME >= MAXTIME){ // failure
          // console.log('Hue Initialization was not completed!');
          checkingInterval.unsubscribe();
        }
      });

    }

  }
}

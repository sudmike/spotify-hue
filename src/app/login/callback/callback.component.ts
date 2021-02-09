import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyWebService } from '../../services/spotify-web.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
})

export class CallbackComponent implements OnInit {

  constructor(private router: Router,
              private route: ActivatedRoute,
              private spotifyService: SpotifyWebService,
              private cookieService: CookieService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(qp => {
      if (qp.accessToken){ // response for spotify
        console.log('Spotify Access Token: ' + qp.accessToken);
        this.spotifyService.setAccessToken(qp.accessToken);
        this.router.navigate(['dashboard']);
      }
      else if (qp.session){ // response for hue
        console.log('Hue Session: ' + qp.session);
        this.cookieService.set('session', qp.session, 100, '/');
      }
      else {
        console.log('Callback received no access token or session!', qp);
      }
    });
  }

}

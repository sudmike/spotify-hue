import { Component } from '@angular/core';
import { SpotifyWebService } from './services/spotify-web.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'spotify-hue';

  constructor(private spotifyService: SpotifyWebService) {
  }

  tempRefresh(): void {
    this.spotifyService.refreshAccessToken();
  }
}

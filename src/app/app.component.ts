import { Component } from '@angular/core';
import { SessionService } from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'spotify-hue';
  sessionActive = false;
  sessionValue = '';

  constructor(private sessionService: SessionService) {
    sessionService.refresh();
    sessionService.observe().subscribe(data => {
      this.sessionActive = true;
      this.sessionValue = data.get();
    });
  }
}

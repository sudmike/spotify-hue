import { Injectable } from '@angular/core';
import { Track } from '../shared/track.model';
import { BackendCommsService } from '../services/backend-comms.service';
import { SpotifyWebService } from '../services/spotify-web.service';
import { interval, Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DashboardSupportService {

  current: Track;
  intervalSubscription: Subscription;
  trackUpdateObservable: Observable<Track>;

  constructor(private backendComms: BackendCommsService,
              private spotifyService: SpotifyWebService) {
  }

  /* subscribable Function oÄ that pushes news about song change */
  /* subscribable Function oÄ that pushes news about pause/unpause */

  beginCheckingCurrentTrack(): Observable<Track>{
    this.trackUpdateObservable = Observable.create(observer => {
      this.intervalSubscription = interval(5000).subscribe(() => {
        this.spotifyService.getCurrentTrack()
          .then(data => {
            console.log('Data', data);
            this.backendComms.getColorOfImg(data.imagePath)
              .then(colors => {
                data.imageHsl = colors.hsl;
                data.imageRgb = colors.rgb;
                observer.next(data);
              })
              .catch(err => {
                console.log('No color from backend: ', err);
                observer.next(data);
              });
          })
          .catch(err => {
            this.intervalSubscription.unsubscribe(); // stop checking every 5 seconds
            observer.error(err);
          });
      });
    });

    return this.trackUpdateObservable;
  }

  rgbToHex(rgb: number[]): string{
    return '#' +
      this.componentToHex(rgb[0]) +
      this.componentToHex(rgb[1]) +
      this.componentToHex(rgb[2]);
  }

  componentToHex(c: number): string{
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  ngOnInitCustom(): void{
  }

  ngOnDestroyCustom(): void{
    this.intervalSubscription.unsubscribe();
  }
}

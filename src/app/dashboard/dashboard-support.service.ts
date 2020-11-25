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


  beginCheckingCurrentTrack(): Observable<Track>{
    this.trackUpdateObservable = Observable.create(observer => {
      this.intervalSubscription = interval(5000).subscribe(() => {
        this.spotifyService.getCurrentTrack()
          .then(data => {
            if (this.current !== undefined && data.id === this.current.id){ // same Track
              if (data.playing === this.current.playing){ // same playstate -> no changes
                // do nothing
              }
              else { // pause/resume -> inform subscribers without getting the color
                data.imageRgb = this.current.imageRgb;
                data.imageHsl = this.current.imageHsl;
                this.current.playing = data.playing;
                observer.next(data);
              }
            }
            else { // different Track -> inform subscribers and get the color
              this.backendComms.getColorOfImg(data.imagePath)
                .then(colors => {
                  data.imageHsl = colors.hsl;
                  data.imageRgb = colors.rgb;
                  this.current = data;
                  observer.next(data);
                })
                .catch(err => {
                  console.log('No color from backend: ', err);
                  this.current = data;
                  observer.next('Non critical Error:', data);
                });
            }
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
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  ngOnInitCustom(): void{
  }

  ngOnDestroyCustom(): void{
    this.intervalSubscription.unsubscribe();
  }
}

import { Injectable } from '@angular/core';
import { Track } from '../shared/track.model';
import { BackendCommsService } from '../services/backend-comms.service';
import { SpotifyWebService } from '../services/spotify-web.service';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { session } from '../shared/session.model';

@Injectable({
  providedIn: 'root'
})

export class DashboardService {

  current: Track;
  intervalSubscription: Subscription;
  linearBackoff = 400; // time to wait past song switch to ensure a valid response

  cachedBrightness: number; // very ugly coding ... resolve through cookies (?)

  constructor(private backendService: BackendCommsService,
              private spotifyService: SpotifyWebService) {
  }


  beginCheckingCurrentTrack(): Observable<Track> {

    return new Observable<Track>(subscriber => {

      let intervalSubscriber: Subscriber<{remaining_ms: number, playing: boolean}>;

      this.intervalSubscription = this.customInterval(
        10000,
        new Observable<{remaining_ms: number, playing: boolean}>(sub => { intervalSubscriber = sub; })
      ).subscribe(() => {
        this.spotifyService.getCurrentTrack()
          .then(data => {
            intervalSubscriber.next({remaining_ms: data.remaining_ms, playing: data.track.playing}); // inform interval
            if (this.current !== undefined && data.track.id === this.current.id) { // same Track
              if (data.track.playing === this.current.playing) { // same playstate -> no changes
                // do nothing
              }
              else { // pause/resume -> inform subscribers without getting the color
                this.current.playing = data.track.playing;
                data.track.imageRgb = this.current.imageRgb;
                data.track.imageHsl = this.current.imageHsl;
                subscriber.next(data.track);
              }
            }
            else { // different Track -> inform subscribers and get the color
              this.backendService.getColorOfImg(data.track.imagePath[1])
                .then(colors => {
                  data.track.imageHsl = colors.hsl;
                  data.track.imageRgb = colors.rgb;
                  this.current = data.track;
                  subscriber.next(data.track);
                })
                .catch(err => {
                  console.log('No color from backend: ', err.message);
                  this.current = data.track;
                  subscriber.next(data.track);
                });
            }
          })
          .catch(err => {
            this.intervalSubscription.unsubscribe(); // stop checking
            subscriber.error(err);
            intervalSubscriber.error();
          });
      });
    });
  }

  private customInterval(basePeriod: number, observable: Observable<{remaining_ms: number, playing: boolean}>): Observable<void> {
    return new Observable<void>(subscriber => {
      subscriber.next(); // kickoff

      observable.subscribe(next => { // gets called when spotify responds, 'next' contains song information to calculate intervaltime
        setTimeout(() => {subscriber.next(); }, this.calculateIntervalTime(basePeriod, next));
      }, () => {
        subscriber.error(); // maybe redundant because subscriber unsubscribes when sending error anyway
      });

    });
  }

  private calculateIntervalTime(defaultPeriod: number, calcParams: {remaining_ms: number, playing: boolean}): number {

    if (!calcParams.playing){ // return max wait time if song is paused
      return defaultPeriod;
    }
    else {
      if (calcParams.remaining_ms < defaultPeriod) { // close to end of song
        if (calcParams.remaining_ms <= 0){ // edge case
          console.log('Negative', calcParams.remaining_ms);
          this.linearBackoff += 25;
          return 1000; // timeout punishment
        }
        else {
          return calcParams.remaining_ms + this.linearBackoff; // + delay between songs
        }
      }
      else {
        return defaultPeriod;
      }
    }
  }

  rgbToHex(rgb: number[]): string {
    return '#' +
      this.componentToHex(rgb[0]) +
      this.componentToHex(rgb[1]) +
      this.componentToHex(rgb[2]);
  }

  private componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  setLights(hsl: number[], brightness: number = 1.0): void {
    this.cachedBrightness = brightness;
    if (session.active()){
      this.backendService.setLights([
        Math.floor(this.map(hsl[0], 0, 1, 0, 360)),
        Math.floor(this.map(hsl[1], 0, 1, 0, 100)),
        Math.floor(this.map(hsl[2], 0, 1, 0, 100))
      ], brightness, session.get());
    }
    else { // no session yet
      console.log('No Session has been set for hue yet! (work in progress)');
      // ...
    }
  }

  turnLightsOff(): void {
    if (session.active()){
      this.backendService.turnLightsOff(session.get());
    }
    else { // no session yet
        console.log('No Session has been set for hue yet! (work in progress)');
        // ...
      }
    }

  private map(value: number, x1: number, y1: number, x2: number, y2: number): number {
    return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
  }

  resetLights(): void {
    if ((this.current && this.current.imageHsl) && this.cachedBrightness){
      this.setLights(
        this.current.imageHsl,
        this.cachedBrightness
      );
    }
    else {
      console.log('Could not reset lights based on cached data');
    }
  }

  ngOnInitCustom(): void {
  }

  ngOnDestroyCustom(): void {
    this.intervalSubscription.unsubscribe();
  }
}

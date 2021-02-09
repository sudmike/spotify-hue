import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardSupportService } from './dashboard-support.service';
import { Track } from '../shared/track.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['dashboard.component.css']
})

export class DashboardComponent implements OnInit, OnDestroy {

  brightnessRange = 1.0;
  activePolling = false;

  currentTrack = new Track();
  cardBackgroundColor: string;
  trackUpdateSubscription: Subscription;

  constructor(private support: DashboardSupportService) {
  }

  ngOnInit(): void {
    this.support.ngOnInitCustom();
    this.trackSongs();
  }

  trackSongs(): void {
    this.trackUpdateSubscription = this.support.beginCheckingCurrentTrack() // receive event every time the song changes/is paused
      .subscribe(data => { // colors
        this.activePolling = true;
        console.log('change detected', data.name, data.playing);
        this.currentTrack = data;
        if (data.imageRgb){ // if rgb is provided, change color behind image
          this.setImageBackground(data.imageRgb);

          if (data.imageHsl){ // if hsl is also provided, set color of philips hues
            console.log(data.imageHsl);
            this.support.setLights(data.imageHsl, this.brightnessRange);
          }
        }
      }, err => {
        console.log('Subscription returns Error: ', err.message);
        this.activePolling = false;
      });

  }

  onBrightnessChange(): void {
    if (this.currentTrack && this.currentTrack.imageHsl){
      this.support.setLights(this.currentTrack.imageHsl, this.brightnessRange);
    }
    else{
      console.log('Could not act on brightness change because there is no current track!');
    }
  }

  setImageBackground(rgb: number[]): void{

    // check for valid numbers
    if (rgb[0] === undefined || rgb[1] === undefined || rgb[2] === undefined ||
      !(rgb[0] >= 0 && rgb[0] <= 255) ||
      !(rgb[1] >= 0 && rgb[1] <= 255) ||
      !(rgb[2] >= 0 && rgb[2] <= 255)
    ){
      this.cardBackgroundColor = '#000000';
    }
    else {
      // check if image is greyscale
      const average = (rgb[0] + rgb[1] + rgb[2]) / 3;
      const variance = (Math.pow(rgb[0] - average, 2) + Math.pow(rgb[1] - average, 2) + Math.pow(rgb[2] - average, 2)) ;
      if (variance < 80){ // grey because r,g,b are very similar -> set background to white
        this.cardBackgroundColor = '#ffffff';
      }
      else { // image has color
        rgb[0] = Math.round(rgb[0]);
        rgb[1] = Math.round(rgb[1]);
        rgb[2] = Math.round(rgb[2]);
        this.cardBackgroundColor = this.support.rgbToHex(rgb);
      }
    }
  }

  ngOnDestroy(): void {
    this.support.ngOnDestroyCustom();

    this.trackUpdateSubscription.unsubscribe();
  }

}

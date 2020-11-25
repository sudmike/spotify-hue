import { Component, OnDestroy, OnInit } from '@angular/core';
import { DashboardSupportService } from './dashboard-support.service';
import { Track } from '../shared/track.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit, OnDestroy {

  currentTrack = new Track();
  cardBackgroundColor: string;
  trackUpdateSubscription: Subscription;

  constructor(private support: DashboardSupportService) {
  }

  ngOnInit(): void {
    this.support.ngOnInitCustom();

    this.trackUpdateSubscription = this.support.beginCheckingCurrentTrack() // receive event every time the song changes/is paused
      .subscribe(data => { // colors
        console.log('change detected', data.name, data.playing);
        this.currentTrack = data;
        if (data.imageRgb){ // if rgb is provided, change color behind image
          this.cardBackgroundColor = this.support.rgbToHex(data.imageRgb);

          if (data.imageHsl){ // if hsl is also provided, set color of philips hues

          }
        }
      }, (err => {
        console.log('Subscription returns Error', err);
      }));
  }

  ngOnDestroy(): void {
    this.support.ngOnDestroyCustom();

    this.trackUpdateSubscription.unsubscribe();
  }

}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HueSetupService } from './hue-setup.service';
import { Light } from '../../shared/light.model';
import * as hash from 'object-hash';

@Component({
  selector: 'app-hue-setup',
  templateUrl: './hue-setup.component.html',
  styleUrls: ['hue-setup.component.css']
})
export class HueSetupComponent implements OnInit, OnDestroy {

  sessionActive = false;

  lightsChanged = false;
  lightsHash: any;

  lights: Light[];

  constructor(private support: HueSetupService) { }

  ngOnInit(): void {
    this.support.ngOnInitCustom();

    // wait for hue session to be initialized
    this.support.listenToSession().subscribe(() => {
      this.sessionActive = true;

      this.support.getLights()
        .then(data => {
          this.lights = data;
          this.lightsHash = hash(JSON.stringify(this.lights));
          this.lightsChanged = false;
        })
        .catch(() => {
          // ... what should happen if lights can't be retrieved
        });
    });
  }

  ngOnDestroy(): void {
    this.support.ngOnDestroyCustom();
  }

  saveLightSelection(): void {
    this.support.chooseLights(this.lights.filter(l => (l.active)).map(l => l.id))
      .then(() => {
        console.log('changed active lights');
        // ... show that request succeeded (checkmark or something)

        this.lightsHash = hash(JSON.stringify(this.lights));
        this.lightsChanged = false;
      })
      .catch(err => {
        console.log(err);
        // ... show that request failed (X or something)
      });
  }

  checkForChange(): void {
    this.lightsChanged = hash(JSON.stringify(this.lights)) !== this.lightsHash;
  }

  activateLight(lightID: number, active: boolean): void {
    this.lights.find(l => l.id === lightID).active = active;
    this.checkForChange();
  }

  pingLight(lightID: number): void {
    this.support.pingLight(lightID)
      .catch(err => {
        console.log(err);
        // ... show that ping failed
      });
  }

  turnLightOff(lightID: number): void {
    this.support.turnLightOff(lightID);
  }


}

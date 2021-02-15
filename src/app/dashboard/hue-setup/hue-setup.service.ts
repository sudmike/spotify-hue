import { Injectable } from '@angular/core';
import { SessionService } from '../../services/session.service';
import { Observable } from 'rxjs';
import { Light } from '../../shared/light.model';
import { BackendCommsService } from '../../services/backend-comms.service';
import { session } from '../../shared/session.model';

@Injectable({
  providedIn: 'root'
})

export class HueSetupService {

  constructor(private sessionService: SessionService,
              private backendService: BackendCommsService) { }

  ngOnInitCustom(): void { }

  ngOnDestroyCustom(): void { }

  listenToSession(): Observable<any> {
    return this.sessionService.observe();
  }

  async getLights(): Promise<Light[]> {
    return this.backendService.getLights(session.get())
      .then(data => {
        return data.map(json => {
          return new Light(json.id, json.name, json.reachable, json.active);
        });
      })
      .catch(err => {
        console.log(err);
        return Promise.reject();
      });
  }

  async chooseLights(lightIDs: number[]): Promise<void> {
    return this.backendService.chooseLights(session.get(), lightIDs)
      .then(() => {
        return Promise.resolve();
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  async pingLight(lightID: number): Promise<void> {
    return this.backendService.pingLight(session.get(), lightID)
      .then(() => {
        return Promise.resolve();
      })
      .catch(err => {
        return Promise.reject(err);
      });
  }

  turnLightOff(lightID: number): void {
    this.backendService.turnLightsOff(session.get(), lightID);
  }
}

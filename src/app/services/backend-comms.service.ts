import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BackendCommsService {

  backendUrl = 'http://localhost:3000/hue/api';

  constructor(private http: HttpClient) {
  }

  // asynchronous function that takes the URL of an image and gets the most prominent color over the backend
  async getColorOfImg(imgURL: string): Promise<{ rgb: number[], hsl: number[] }> {

    return this.http.get(this.backendUrl + '/vibrant-color' + '?imageURL=' + imgURL).toPromise() // bad style ?
      .then((res:
                  { status: string, data: { hsl: number[], rgb: number[] } } |
                  { status: string, message: string }
    ) => {
          if (res.status === 'success') { // Value Returned
            return (res as { status: string, data: { hsl: number[], rgb: number[] } }).data;
          }
          else if (res.status === 'error') { // Error Returned
            return Promise.reject(Error((res as { status: string, message: string }).message));
          }
          else {
            return Promise.reject(Error('Communication Error when getting color from backend'));
          }
      })
      .catch(err => {
        return (err instanceof Error)
          ? Promise.reject(err)
          : Promise.reject(Error('Communication Error when getting color from backend'));
      });
  }

  async getSpotifyRefresh(): Promise<{accessToken: string}> {
    return this.http.get(this.backendUrl + '/spotify-refresh').toPromise()
      .then((res:
               {status: string, data: {accessToken: string}} |
               {status: string, message: string}
      ) => {
        console.log(res);
        if (res.status === 'success'){
          return {accessToken: (res as {status: string, data: {accessToken: string}}).data.accessToken};
        }
        else {
          return Promise.reject(Error((res as {status: string, message: string}).message));
        }
      })
      .catch(err => {
        return (err instanceof Error)
          ? Promise.reject(err)
          : Promise.reject(Error('Communication with backend failed while trying to refresh spotify access token'));
      });
  }

  // asynchronous function that takes an hsl color set and tells the backend to set the philips hues accordingly
  setLights(HSL: number[], Brightness: number, Session: string): void {
    this.http.post(
      this.backendUrl + '/hue-setLights',
      {
        hsl: HSL,
        brightness: Brightness,
        session: Session
      }
    ).toPromise()
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      });
  }

  async getLights(Session: string): Promise<{id: number, name: string, reachable: boolean, active: boolean}[]> {
    return this.http.get(
      this.backendUrl + '/hue-getLights' + '?session=' + Session
    ).toPromise()
      .then((res:
    {status: string, data: {lights: {name: string, id: number, reachable: boolean, active: boolean}[]}} |
    {status: string, message: string}
  ) => {
        console.log(res);

        if (res.status === 'success'){
          return (res as {status: string, data: {lights: {name: string, id: number, reachable: boolean, active: boolean}[]}}).data.lights;
        }
        else {
          return Promise.reject('Could not get Lights from backend.' + (res as {status: string, message: string}).message);
        }
      })
      .catch(err => {
        return (err instanceof Error)
        ? Promise.reject(err)
        : Promise.reject(Error('Could not get Lights from backend'));
      });
  }

  async chooseLights(Session: string, LightIDs: number[]): Promise<void>{
    return this.http.post (
      this.backendUrl + '/hue-chooseLights',
      {
        session: Session,
        lightIDs: LightIDs
      }
    ).toPromise()
      .then((res:
               {status: string, data: {} } |
               {status: string, message: string}
      ) => {
        if (res.status === 'success'){
          return Promise.resolve();
        }
        else {
          console.log(res);
          return Promise.reject(Error((res as {status: string, message: string}).message));
        }
      })
      .catch(err => {
        return (err instanceof Error)
        ? Promise.reject(err)
        : Promise.reject(Error('Failed to set lights as active'));
      });
  }

  pingLight(Session: string, LightID: number): Promise<void> {
    return this.http.post (
      this.backendUrl + '/hue-pingLight',
      {
        session: Session,
        lightID: LightID
      }
    ).toPromise()
      .then((res:
               {status: string, data: {} } |
               {status: string, message: string}
      ) => {
        if (res.status === 'success'){
          return Promise.resolve();
        }
        else {
          console.log(res);
          return Promise.reject(Error((res as {status: string, message: string}).message));
        }
      })
      .catch(err => {
        return (err instanceof Error)
          ? Promise.reject(err)
          : Promise.reject(Error('Failed to ping light with ID ' + LightID));
      });
    }
}

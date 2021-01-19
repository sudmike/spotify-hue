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
        if (err instanceof Error) {
          return Promise.reject(err);
        }
        else {
          return Promise.reject(Error('Communication Error when getting color from backend'));
        }
      });
  }

  // asynchronous function that takes an hsl color set and tells the backend to set the philips hues accordingly
  setLights(HSL: number[]): void {
    this.http.post(this.backendUrl + '/hue-setLights', {hsl: HSL}).toPromise()
      .then(data => {
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

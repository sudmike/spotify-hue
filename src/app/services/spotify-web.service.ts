import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { BackendCommsService } from './backend-comms.service';
import { Track } from '../shared/track.model';

@Injectable({
  providedIn: 'root'
})

export class SpotifyWebService {

  private spotifyApi = new SpotifyWebApi();

  constructor( private backendService: BackendCommsService) { }

  setAccessToken(accessToken: string): void {
    this.spotifyApi.setAccessToken(accessToken);

    console.log('Access Token Set');
  }

  async getCurrentTrack(): Promise<{track: Track, remaining_ms: number}> {

    return this.spotifyApi.getMyCurrentPlayingTrack()
      .then(data => {
        if (!data.item){ // case that Spotify answers but without any data
          return Promise.reject(Error('Not currently listening'));
        }
        else{
          return {
            track: new Track(
              data.item.id,
              data.item.name,
              data.item.artists.map(artist => artist.name),
              data.item.album.images.map(image => image.url),
              data.is_playing),
            remaining_ms: data.item.duration_ms - data.progress_ms
          };
        }
      })
      .catch(err => {
        if (err instanceof Error){
          return Promise.reject(err);
        }
        else {
          // console.log(err);
          return Promise.reject(Error('Unable to get current Track'));
        }
      });
  }

  refreshAccessToken(): void {
    this.backendService.getSpotifyRefresh()
      .then(data => {
        this.setAccessToken(data.accessToken);
      })
      .catch(err => {
        console.log(err);
      });
  }
}

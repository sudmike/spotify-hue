import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { BackendCommsService } from './backend-comms.service';
import { Track } from '../shared/track.model';

@Injectable({
  providedIn: 'root'
})

export class SpotifyWebService {

  private spotifyApi = new SpotifyWebApi();
  private spotifyTokenTime: number;

  constructor( private backendService: BackendCommsService) { }

  setAccessToken(accessToken: string): void {
    this.spotifyApi.setAccessToken(accessToken);

    this.spotifyTokenTime = Math.round(Date.now() / 1000);

    console.log('Access Token Set');
  }

  async getCurrentTrack(): Promise<{track: Track, remaining_ms: number}> {

    if (Math.round(Date.now() / 1000) > this.spotifyTokenTime + (60 * 55)) { // access token should be renewed
      return this.refreshAccessToken()
        .then(() => {
          return this.getCurrentTrack();
        })
        .catch(err => {
          return Promise.reject(err);
        });
    }

    else { // access token is still valid
      return this.spotifyApi.getMyCurrentPlayingTrack()
        .then(data => {
          if (!data.item){ // case that Spotify answers but without any data
            return Promise.reject(Error('Not currently listening'));
          }
          else {
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
          return (err instanceof Error)
            ? Promise.reject(err)
            : Promise.reject(Error('Unable to get current Track'));
        });
    }
  }

  async refreshAccessToken(): Promise<void> {
    return this.backendService.getSpotifyRefresh()
      .then(data => {
        this.setAccessToken(data.accessToken);
        return Promise.resolve();
      })
      .catch(err => {
        return (err instanceof Error)
          ? Promise.reject(err)
          : Promise.reject(Error('Could not refresh access token'));
      });
  }
}

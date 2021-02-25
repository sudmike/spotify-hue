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

  async navigateToConsentForm(): Promise<void> {
    // static parameters
    const clientId = '954319b997ba428fad69349169e417d2';
    const redirectUri = 'http://localhost:4200/login/callback';
    const scope = 'user-read-playback-state';

    // generated parameters
    const verifier = this.generateRandomString(128);
    const challenge = this.base64url( await this.sha256(verifier) );
    const state = this.generateRandomString(64);

    // write away parameters needed for token endpoint
    sessionStorage.setItem('state', state);
    sessionStorage.setItem('verifier', verifier);

    console.log('Verifier: ', verifier);
    console.log('Challenge: ', challenge);
    console.log('State: ', state);

    // navigate to spotify consent form
    window.location.href =
      'https://accounts.spotify.com/authorize' + '?' +
      'client_id=' + clientId + '&' +
      'response_type=code' + '&' +
      'redirect_uri=' + redirectUri + '&' +
      'code_challenge_method=S256' + '&' +
      'code_challenge=' + challenge + '&' +
      'state=' + state + '&' +
      'scope=' + scope;
  }

  // useful for creation of authorization state and verifier
  private generateRandomString(num: number): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < num; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private async sha256(message: string): Promise<string> {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
  }

  private base64url(message: string): string {
    return btoa(message);
  }

}



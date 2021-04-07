import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { BackendCommsService } from './backend-comms.service';
import { Track } from '../shared/track.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class SpotifyWebService {

  // static parameters
  private clientId = '954319b997ba428fad69349169e417d2';
  private redirectUri = 'http://localhost:4200/login/callback';
  private scope = 'user-read-playback-state';

  private spotifyApi = new SpotifyWebApi();
  private spotifyTokenTime: number;
  private refreshToken: string;

  constructor( private backendService: BackendCommsService,
               private http: HttpClient) { }

  setAccessToken(accessToken: string): void {
    this.spotifyApi.setAccessToken(accessToken);

    this.spotifyTokenTime = Math.round(Date.now() / 1000);

    console.log('Access Token Set');
  }

  async getCurrentTrack(): Promise<{track: Track, remaining_ms: number}> {

    if (Math.round(Date.now() / 1000) > this.spotifyTokenTime + (60 * 55)) { // access token should be renewed
      return this.refreshAccessToken()
        .then(() => {
          console.log('Spotify access token has been refreshed');
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

  async refreshAccessToken(type: string = 'pkce'): Promise<void> {
    if (type === 'pkce'){ // refresh over back channel
      if (!this.refreshToken) {
        return Promise.reject(Error('there is no refresh token to perform the refresh'));
      }
      else {
        return this.http.post( // request to spotify's token endpoint
          'https://accounts.spotify.com/api/token',
          new HttpParams()
            .set('client_id', this.clientId)
            .set('grant_type', 'refresh_token')
            .set('refresh_token', this.refreshToken)
            .toString(),
          {
            headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
          }
        ).toPromise()
          .then(
            (res:
               {
                 access_token: string,
                 expires_in: number,
                 refresh_token: string,
                 scope: string,
                 token_type: string
               }
            ) => {
              this.setAccessToken(res.access_token);
              this.refreshToken = res.refresh_token;
              return Promise.resolve();
            })
          .catch(e => {
            return Promise.reject(Error('failed refreshing spotify tokens'));
          });
      }
    }
    else { // refresh over back channel
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

  async authorizationRequest(): Promise<void> {
    // generated parameters
    const verifier = this.generateRandomString(128);
    const challenge = await this.generateChallenge(verifier);
    const state = this.generateRandomString(64);

    // write away parameters needed for token endpoint
    localStorage.setItem('state', state);
    localStorage.setItem('verifier', verifier);

    // navigate to spotify consent form
    window.location.href =
      'https://accounts.spotify.com/authorize' + '?' +
      'client_id=' + this.clientId + '&' +
      'response_type=code' + '&' +
      'redirect_uri=' + this.redirectUri + '&' +
      'code_challenge_method=S256' + '&' +
      'code_challenge=' + challenge + '&' +
      'state=' + state + '&' +
      'scope=' + this.scope;
  }

  async accessTokenRequest(authorizationCode: string): Promise<void> {
    if (!localStorage.getItem('verifier')){ // no verifier in local storage
      return Promise.reject();
    }
    else {
      const verifier = localStorage.getItem('verifier');
      localStorage.removeItem('verifier');

      return this.http.post( // request to spotify's token endpoint
        'https://accounts.spotify.com/api/token',
        new HttpParams()
          .set('client_id', this.clientId)
          .set('code_verifier', verifier)
          .set('grant_type', 'authorization_code')
          .set('code', authorizationCode)
          .set('redirect_uri', this.redirectUri)
          .toString(),
        {
          headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
        }
      ).toPromise()
        .then(
          (res:
             {
               access_token: string,
               expires_in: number,
               refresh_token: string,
               scope: string,
               token_type: string
             }
          ) => {
            this.setAccessToken(res.access_token);
            this.refreshToken = res.refresh_token;
            return Promise.resolve();
        })
        .catch(e => {
          return Promise.reject();
        });
    }

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

  private async generateChallenge(verifier): Promise<string> {

    const encodedVerifier = new TextEncoder().encode(verifier);
    const hashedVerifier = await window.crypto.subtle.digest('SHA-256', encodedVerifier);

    return btoa(String.fromCharCode.apply(null, new Uint8Array(hashedVerifier)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  }

}



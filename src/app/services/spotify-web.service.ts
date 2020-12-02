import { Injectable } from '@angular/core';
import SpotifyWebApi from 'spotify-web-api-js';
import { Track } from '../shared/track.model';

@Injectable({
  providedIn: 'root'
})

export class SpotifyWebService {

  private spotifyApi = new SpotifyWebApi();

  constructor() { }

  setAccessToken(accessToken: string): void{
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
}


// var v3 = require('node-hue-api').v3;
// var Vibrant = require('node-vibrant')
//
// const HUE_USERNAME = 'bGtVf2zPc9RETZBfwVZi6M5xDvf-x0yT4fAWGI1N'
// const LIGHT_NAME = 'Color'
// var LIGHT_ID
// var volume
// var hueApi
//
//
//
//
// function setup(){
//   hueSetup();
// }
//
//
// function main(previous_songId, previous_playing){
//   var songId, songName, imageUrl, playing
//
//   spotifyApi.getMyCurrentPlaybackState({
//   })
//     .then(function(data) {
//       if(data.statusCode === 200 && data.body !== {} && data.body.item !== null){
//         songId = data.body.item.id
//         songName = data.body.item.name
//         imageUrl = data.body.item.album.images[1].url
//         playing = data.body.is_playing
//         volume = data.body.device.volume_percent/100
//       }
//     }, function(err) {
//       console.log(err);
//       death();
//     })
//     .catch(function(err){
//       console.log(err);
//       death()
//     })
//     //Compare song to last call
//     .then(function(){
//       if(playing !== true){ //song is not playing
//         if(previous_playing !== false){     //just paused (previous_playing = true or undefined)
//           playing = false                 //explicit because undefined could be passed
//           waitTime = PLAYBACK_WAIT_TIME/2   //wait time dependant on playback wait Time
//           setLight(undefined)         //only turning the lights out once
//         }
//         else{ //idea: exponential backoff with limit
//           if(waitTime < MAX_PAUSE_WAIT_TIME){
//             waitTime = waitTime*1.1
//           }
//           else waitTime = MAX_PAUSE_WAIT_TIME
//
//         }
//       }
//       else{ //song is playing
//         if(previous_songId !== songId){ //song has changed
//           console.log(songName);
//           //console.log('Image URL: ' + imageUrl);
//           getColor(imageUrl)
//           //.then(hsb => {
//           //    setLight(hsb)
//           //})
//
//         }
//         if(previous_playing !== playing){ //song was just unpaused
//           waitTime = PLAYBACK_WAIT_TIME
//           getColor(imageUrl)
//         }
//       }
//
//       if(tokenExpiration < 300000){ //Token expires in under 5 minutes (300000)
//         refreshToken();
//       }
//     })
//     .then(function () {
//       tokenExpiration -= waitTime;
//       setTimeout(main, waitTime, songId, playing);/* DAVOR previous_playing ÜBERGEBEN?*/
//     })
// }
//
//
//
// function hueSetup(){
//   v3.discovery.nupnpSearch()
//     .then(searchResults => {
//       const host = searchResults[0].ipaddress;
//       return v3.api.createLocal(host).connect(HUE_USERNAME);
//     })
//     .catch(function (err){
//       console.log('Unable to connect to Bridge')
//       console.log(err);
//       death()
//     })
//     .then(api => {
//       hueApi = api;
//       return api.lights.getLightByName(LIGHT_NAME);
//     })
//     .then(light => {
//       if(light.state.reachable === true){
//         console.log('Good Light Connect!');
//         LIGHT_ID = light.id
//       }
//       else{
//         console.log('Unable to reach Light bulb')
//         death()
//       }
//     })
//     .catch(function(err){
//       console.log('Unable to find light bulb named ' + LIGHT_NAME)
//       console.log(err)
//       death()
//     })
// }
//
//
// function setLight(hsl) {
//   if(hsl === undefined){
//     hueApi.lights.setLightState(LIGHT_ID, {on: false})
//       .catch(function (err){
//         console.log('Unable to turn off Light', err)
//         death()
//       })
//   }
//   else{
//     var _hue = hsl[0]*65535
//     var _sat = hsl[1]*254
//     var _bri = hsl[2]*254*volume
//     _hue = Math.trunc(_hue)
//     _sat = Math.trunc(_sat)
//     _bri = Math.trunc(_bri)
//
//     //console.log("hue:" + _hue + ", sat:" + _sat + ", bri:" + _bri)
//
//     hueApi.lights.setLightState(LIGHT_ID, {on: true, hue:_hue, sat:_sat, bri:_bri})
//       .catch(function (err){
//         console.log('Unable to set Light', err)
//         death()
//       })
//   }
// }

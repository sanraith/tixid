import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

const AUDIO_ENABLED_COOKIE_KEY = "tixid.audio.isEnabled";

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  get isEnabled(): boolean { return this._isEnabled; }
  set isEnabled(value: boolean) {
    this._isEnabled = value;
    this.cookieService.set(AUDIO_ENABLED_COOKIE_KEY, `${value}`, 365 * 10, '/');
  }

  private _isEnabled: boolean;
  private currentAudio: HTMLAudioElement | null = null;
  private effects: Record<string, HTMLAudioElement> = {};

  constructor(private cookieService: CookieService) {
    if (!this.cookieService.check(AUDIO_ENABLED_COOKIE_KEY)) {
      this.isEnabled = true;
    }
    this._isEnabled = this.cookieService.get(AUDIO_ENABLED_COOKIE_KEY) === 'true';

    for (let effect of Object.values(SoundEffect)) {
      let audio = new Audio();
      audio.src = `assets/sound/${effect}`;
      audio.load();
      audio.onended = () => this.currentAudio = null;
      this.effects[effect] = audio;
    }
  }

  play(effect: SoundEffect): void {
    if (!this.isEnabled) {
      return;
    }

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    this.currentAudio = this.effects[effect];
    this.currentAudio.play();
  }
}

export enum SoundEffect {
  PlaceCard = "placeCard.mp3",
  StepChange = "stateChangeBeeps.mp3",
  PlayerJoined = "2beeps.mp3",
  PlayerLeft = "2beepsLow.mp3",
  GameEndTone = "gameEndTone.mp3",
  GuessedRight = "guessedRight.mp3",
  GuessedWrong = "guessedWrong.mp3"
}

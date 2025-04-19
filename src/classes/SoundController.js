import impactSound from "../../static/audio/sfx_sounds_impact4.wav";
import explosionSound from "../../static/audio/sfx_exp_short_soft1.wav";
import beepSound from "../../static/audio/tone1.mp3";
import boopSound from "../../static/audio/twoTone1.mp3";

import { Howl } from "howler";

let volume = 0.3;
let muted = true;
var sfx = {
  impact: new Howl({ src: beepSound, volume: volume, mute: muted }),
  explosion: new Howl({ src: boopSound, volume: volume, mute: muted }),
};

export default sfx;

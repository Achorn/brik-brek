import impactSound from "../../static/audio/sfx_sounds_impact4.wav";
import explosionSound from "../../static/audio/sfx_exp_short_soft1.wav";
import beepSound from "../../static/audio/sfx_sounds_Blip9.wav";
import boopSound from "../../static/audio/sfx_sounds_Blip7.wav";

import { Howl } from "howler";

var sfx = {
  impact: new Howl({ src: boopSound, volume: 0.02, mute: true }),
  explosion: new Howl({ src: beepSound, volume: 0.02, mute: true }),
};

export default sfx;

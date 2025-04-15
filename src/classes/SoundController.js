// import explosionSound from "../../../static/audio/sfx_exp_short_soft1.wav";
import impactSound from "../../static/audio/sfx_sounds_impact4.wav";
import explosionSound from "../../static/audio/sfx_exp_short_soft1.wav";

import { Howl } from "howler";

var sfx = {
  impact: new Howl({ src: impactSound }),
  explosion: new Howl({ src: explosionSound }),
};

export default sfx;

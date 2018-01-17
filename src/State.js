import Phaser from 'phaser';
import zipWith from 'lodash/zipWith';
import get from 'lodash/get';
import { killChildTweens } from './utils/gsapUtils';

const {
  TweenMax,
  TimelineMax,
} = window;

// all tweens inside JackpotSlots will have data.type set to 'jackpot-slots'
// so we can safely clean up tweens for this module only.
// Calling TweenMax.killAll() will also kill tweens in SFP and any other module
// that uses gsap.

// all TweenMax functions that return a tween
const fns = 'from fromTo to delayedCall staggerFrom staggerTo staggerFromTo set'.split(' ');

export default class State extends Phaser.State {

  paused() {
    console.log('paused!')
    this.pausedTweens = TweenMax.getAllTweens(true).filter((tween) => {
      const shouldPause = tween.isActive() && get(tween, 'data.group') === this.key;
      // const shouldPause = true;
      if (shouldPause) tween.pause();
      return shouldPause;
    });
  }

  resumed() {
    console.log('resumed!')
    this.pausedTweens.forEach((tween) => {
      tween.resume();
    })
    this.pausedTweens = [];
  }

  tweenMax() {
    // memoize this function
    this._tweenMax = this._tweenMax || {
      ...TweenMax,
      ...zipWith(fns, prop => (
        (...args) => {
          const tl = TweenMax[prop](...args);
          tl.data = { ...tl.data, group: this.key };
          return tl;
        }
      )),
    };
    return this._tweenMax;
  }

  timelineMax(options) {
    const tl = new TimelineMax(options);
    tl.data = { ...tl.data, group: this.key };
    return tl;
  }

  // kill tweens created by this state and their child tweens for timelines.
  killAllTweens() {
    TweenMax.getAllTweens(true).forEach((tween) => {
      if (get(tween, 'data.group') === this.key) {
        killChildTweens([tween]);
        tween.kill();
      }
    });
  }
}

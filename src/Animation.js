import flatten from 'lodash/flatten';
import noop from 'lodash/noop';
import random from 'lodash/random';
import shuffle from 'lodash/shuffle';

const {
  TimelineMax,
  TweenMax,
} = window;

const Light = {
  off: { alpha: 0 },
  on: { alpha: 1 },
};

export function alternateLights(lights, repeat = 0) {
  console.log('alternateLights!!!!!!!!!!!!')
  const tl = new TimelineMax({ repeat });
  flatten(lights).forEach((light, i) => {
    if (i % 2 === 0) {
      tl.add(TweenMax.set(light, Light.on), 0);
      tl.add(TweenMax.set(light, Light.off), 1);
    } else {
      tl.add(TweenMax.set(light, Light.off), 0);
      tl.add(TweenMax.set(light, Light.on), 1);
    }
  });
  tl.add(noop, 2);
  return tl;
}

function lightsOff(lights) {
  flatten(lights).forEach((light) => {
    TweenMax.set(light, Light.off);
  });
}

export function cycle(lights, repeat = 0) {
  const tl = new TimelineMax({ repeat, onStart: lightsOff, onStartParams: [lights] });
  flatten(lights).forEach((light) => {
    tl.to(light, 0.05, Light.on);
  });
  tl.add(noop, '+=1');
  return tl;
}

export function letterCycle(lights, repeat = 0) {
  const tl = new TimelineMax({ repeat, onStart: lightsOff, onStartParams: [lights] });
  lights.forEach((letter) => {
    const miniTl = new TimelineMax();
    letter.forEach(light => {
      miniTl.to(light, 0.1, { delay: 1, alpha: 1 });
    });
    miniTl.totalDuration(1);
    tl.add(miniTl, 0);
  });
  tl.add(noop, '+=1');
  return tl;
}

export function letterReveal(lights, repeat = 0) {
  const tl = new TimelineMax({ repeat, onStart: lightsOff, onStartParams: [lights] });
  lights.map(letter => (
    tl.add(TweenMax.staggerTo(letter, 0.1, Light.on, 0), '+=0.1')
  ));
  tl.add(noop, '+=2');
  return tl;
}

export function letterFlash(lights, repeat = 0) {
  const tl = new TimelineMax({ repeat });
  lights.forEach((letter, i) => {
    letter.forEach((light) => {
      if (i % 2 === 0) {
        tl.to(light, 0.2, Light.on, 0);
        tl.to(light, 0.2, Light.off, 1);
      } else {
        tl.to(light, 0.2, Light.off, 0);
        tl.to(light, 0.2, Light.on, 1);
      }
    });
  });
  tl.add(noop, 2);
  return tl;
}

export function sparkle(lights, repeat = 0) {
  const shuffleLights = shuffle(flatten(lights));
  const tl = new TimelineMax({ repeat, onStart: lightsOff, onStartParams: [lights] });
  shuffleLights.forEach(light => {
    tl.add(TweenMax.fromTo(light, 1, Light.off, {
      alpha: 1,
      repeat: 1,
      yoyo: true,
    }), random(0.1, 2));
  });
  return tl;
}

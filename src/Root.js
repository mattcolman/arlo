import React, { Component } from 'react';
import Game from './Game';
import BootState from './states/Boot';
import VictoryBoot from './states/VictoryBoot';

const defaultProps = {
  isDesktop: true,
  onSpin: () => {},
  resolution: 1,
  unlockTime: null,
  freeTicketsRemaining: 2,
  spinsRemaining: 2,
};

function createMainGame(parent, props = {}) {
  const initialProps = {
    ...defaultProps,
    ...props,
  };

  const WORLD_WIDTH = initialProps.isDesktop ? 950 : 714;
  const WORLD_HEIGHT = initialProps.isDesktop ? 550 : 550;

  const config = {
    transparent: true,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    parent,
    resolution: initialProps.resolution,
    state: BootState,
    renderer: Phaser.CANVAS,
  };

  const game = new Game(config, initialProps);
  return game;
}

function createVictoryGame(parent, props = {}) {
  const initialProps = {
    ...defaultProps,
    ...props,
  };

  const WORLD_WIDTH = initialProps.isDesktop ? 1300 : 850;
  const WORLD_HEIGHT = initialProps.isDesktop ? 750 : 1400;

  const config = {
    transparent: true,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    parent,
    resolution: initialProps.resolution,
    state: VictoryBoot,
    renderer: Phaser.CANVAS,
  };

  const game = new Game(config, initialProps);
  return game;
}

class Root extends Component {
  state = {
    score: null,
  };
  game;

  componentDidMount() {
    window.isMobile = !!window.matchMedia('(max-width: 768px)').matches;
    this.game = createMainGame('game', {
      isDesktop: true,
      // unlockTime: 1499627684557,
      freeTicketsRemaining: 10,
      spinsRemaining: 2,
      spinCount: 1,
      onSpin: () => {
        setTimeout(() => {
          this.game.signals.componentDidUpdate.dispatch({
            result: { sport: 'afl' },
            spinCount: 2,
            spinsRemaining: 1,
          });
        }, 2000);
      },
      onSpinComplete: () => {
        console.log('spin complete!!');
      },
    });
  }

  render() {
    return null;
  }
}

export default Root;

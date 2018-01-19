import React, { Component } from 'react';
import BootState from './states/Boot';

const defaultProps = {
  isDesktop: true,
  resolution: 1,
};

function createMainGame(parent, props = {}) {
  const initialProps = {
    ...defaultProps,
    ...props,
  };

  const WORLD_WIDTH = initialProps.isDesktop ? 1366 : 1366;
  const WORLD_HEIGHT = initialProps.isDesktop ? 768 : 768;

  const config = {
    transparent: true,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    parent,
    resolution: initialProps.resolution,
    state: BootState,
    renderer: Phaser.AUTO,
  };

  const game = new Phaser.Game(config);
  return game;
}

class Root extends Component {
  state = {
    score: null,
  };
  game;

  componentDidMount() {
    window.isMobile = !!window.matchMedia('(max-width: 768px)').matches;
    createMainGame('game');
  }

  render() {
    return null;
  }
}

export default Root;

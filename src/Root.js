import React, { Component } from 'react';
import BootState from './states/Boot';
import EndScreen from './EndScreen';

const defaultProps = {
  isDesktop: true,
  resolution: 1,
};

class Root extends Component {
  state = {
    wonBonus: false,
  };
  game;

  componentDidMount() {
    window.isMobile = !!window.matchMedia('(max-width: 768px)').matches;
    this.game = this.createMainGame('game');
  }

  createMainGame(parent, props = {}) {
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
    game.onGameComplete = new Phaser.Signal();
    game.onGameComplete.add(() => {
      this.setState({ wonBonus: true });
    });
    return game;
  }

  render() {
    const { wonBonus } = this.state;
    if (!wonBonus) return null;
    return <EndScreen />;
  }
}

export default Root;

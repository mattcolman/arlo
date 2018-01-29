import React, { Component } from 'react';
import glamorous from 'glamorous';
import portraitImg from '../assets/images/portrait.png';
import BootState from './states/Boot';
import EndScreen from './EndScreen';

const defaultProps = {
  isDesktop: true,
  resolution: 1,
};

const BlackBackground = glamorous.div({
  width: '100vw',
  height: '100vh',
  backgroundColor: 'black',
  position: 'absolute',
  top: 0,
  left: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const StyledImage = glamorous.img({
  width: '100%',
  height: 'auto',
  maxWidth: 300,
});

function RotateDevice() {
  return (
    <BlackBackground>
      <StyledImage src={portraitImg} alt="" />
    </BlackBackground>
  );
}

class Root extends Component {
  state = {
    wonBonus: false,
    isWrongOrientation: window.innerHeight > window.innerWidth,
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
    game.onEnterIncorrectOrientation = new Phaser.Signal();
    game.onLeaveIncorrectOrientation = new Phaser.Signal();
    game.onGameComplete.add(() => {
      this.setState({ wonBonus: true });
    });
    game.onEnterIncorrectOrientation.add(() => {
      game.stage.visible = false;
      this.setState({ isWrongOrientation: true });
    });
    game.onLeaveIncorrectOrientation.add(() => {
      window.location.reload();
    });
    return game;
  }

  render() {
    const { wonBonus, isWrongOrientation } = this.state;
    if (isWrongOrientation) {
      return <RotateDevice />;
    }
    if (!wonBonus) return null;
    return <EndScreen />;
  }
}

export default Root;

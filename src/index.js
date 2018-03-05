import BootState from './states/Boot';

function createGame() {
  const isDesktop = window.matchMedia('(min-width: 1280px)').matches;
  window.isDesktop = isDesktop;
  const WORLD_WIDTH = isDesktop ? 1366 : 1366;
  const WORLD_HEIGHT = isDesktop ? 768 : 768;

  const config = {
    transparent: true,
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    parent: 'game',
    resolution: 1,
    state: BootState,
    renderer: Phaser.AUTO,
  };

  const game = new Phaser.Game(config);
  game.onEnterIncorrectOrientation = new Phaser.Signal();
  game.onLeaveIncorrectOrientation = new Phaser.Signal();
  game.onEnterIncorrectOrientation.add(() => {
  });
  game.onLeaveIncorrectOrientation.add(() => {
  });
  return game;
}

createGame();

import ManifestLoader from 'phaser-manifest-loader';
import Main from './Main';

const { Phaser } = window;

const req = require.context('../../assets', true, /.*\.png|json|ttf|woff|woff2|xml|mp3|jpg|jpeg$/);

const MANIFEST = {
  audio: [
  ],
  spritesheets: ['sprites'],
  images: ['main', 'arlo', 'arlo-look-up'],
  bitmap_fonts: ['arnold'],
  // fonts: {
  //   custom: {
  //     families: ['panton_extraboldregular'],
  //   },
  // },
};

export default class extends Phaser.State {
  create() {
    const loader = this.game.plugins.add(ManifestLoader, req);
    loader.loadManifest(MANIFEST).then(() => {
      console.log('loaded!');
      this.setupStage();
      this.addStates();
      this.startGame();
    });
  }

  setupStage() {
    this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    // if (window.isDesktop) {
    this.scale.setResizeCallback(this.scaleGame);
    // }
    this.input.maxPointers = 1;
    this.scaleGame();

    this.game.scale.enterIncorrectOrientation.add(() => {
      this.game.onEnterIncorrectOrientation.dispatch();
    });
    this.game.scale.leaveIncorrectOrientation.add(() => {
      this.game.onLeaveIncorrectOrientation.dispatch();
      this.scaleGame();
    });
    this.game.clearBeforeRender = false;
  }

  scaleGame = () => {
    // const { offsetWidth, offsetHeight } = this.game.canvas.parentElement;
    const padding = window.isDesktop ? 80 : 0;
    const xScale = window.innerWidth / this.game.width;
    const yScale = (window.innerHeight - padding) / this.game.height;
    const scale = Math.min(xScale, yScale);
    // console.log('scaleGame', scale);
    this.scale.setUserScale(scale, scale);
  };

  addStates() {
    this.state.add('Main', Main);
  }

  startGame() {
    this.state.start('Main');
  }
}

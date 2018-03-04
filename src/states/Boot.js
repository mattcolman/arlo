import ManifestLoader from 'phaser-manifest-loader';
import Main from './Main';
import '../../assets/fonts/panton/stylesheet.css';

const { Phaser } = window;

const req = require.context('../../assets', true, /.*\.png|json|ttf|woff|woff2|xml|mp3|jpg|jpeg$/);

const MANIFEST = {
  audio: [
  ],
  spritesheets: ['sprites'],
  images: ['main', 'arlo'],
  bitmap_fonts: [],
  fonts: {
    custom: {
      families: ['panton_extraboldregular'],
    },
  },
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
    if (window.isMobile) {
      this.scale.forceLandscape = true;
    } else {
      this.scale.setResizeCallback(this.scaleGame);
    }
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
    // const xScale = window.innerWidth / this.game.width;
    const padding = window.isMobile ? 0 : 80;
    const yScale = (window.innerHeight - padding) / this.game.height;
    // const scale = Math.min(xScale, yScale);
    const scale = Math.min(yScale, 1);
    // console.log('scaleGame', window.innerHeight, this.game.height);
    this.scale.setUserScale(scale, scale);
  };

  addStates() {
    this.state.add('Main', Main);
  }

  startGame() {
    this.state.start('Main');
  }
}

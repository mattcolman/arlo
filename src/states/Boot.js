import ManifestLoader from 'phaser-manifest-loader';
import Main from './Main';

const { Phaser } = window;

const req = require.context('../../assets', true, /.*\.png|json|ttf|woff|woff2|xml|mp3|jpg|jpeg$/);

const MANIFEST = {
  audio: [
    'fart',
    'blup',
    'blop',
    'click_slip',
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
    this.setupStage();
    this.addStates();
    const loader = this.game.plugins.add(ManifestLoader, req);
    loader.loadManifest({
      images: ['spinner'],
    }).then(() => {
      this.showLoader();
      Promise.all([
        loader.loadManifest(MANIFEST),
        this.loadConfig(),
      ]).then(() => {
        TweenMax.killTweensOf(this.spinner);
        this.spinner.destroy();
        this.startGame();
      });
    });
  }

  loadConfig() {
    return new Promise((resolve) => {
      window.fetch('/config.json').then(res => res.json()).then((json) => {
        this.game.config = json;
        this.game.config.photos.forEach((photo, i) => {
          this.load.image(`photo${i + 1}`, photo);
        });
        this.load.onLoadComplete.addOnce(() => {
          resolve();
        });
        this.load.start();
      });
    });
  }

  showLoader() {
    this.spinner = this.add.image(this.world.centerX, this.world.centerY, 'spinner');
    this.spinner.anchor.set(0.5);
    TweenMax.to(this.spinner, 2, { angle: 360, repeat: -1, ease: Linear.easeNone });
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

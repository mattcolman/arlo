import ManifestLoader from 'phaser-manifest-loader';
import PlayersJson from '../../lib/players.json';
import Main from './Main';

const { Phaser } = window;

const req = require.context('../../assets', true, /.*\.png|json|ttf|woff|woff2|xml|mp3|jpg|jpeg$/);

const MANIFEST = {
  audio: ['click', 'spin', 'select', 'success'],
  spritesheets: ['assets', 'players'],
  images: ['background', 'star_particle', 'blue_particle'],
  bitmap_fonts: ['pantoon_white', 'pantoon_yellow', 'phosphate'],
  // fonts: {
  //   custom: {
  //     families: ['panton_extraboldregular'],
  //   },
  // },
};

export default class extends Phaser.State {
  create() {
    console.log('go');
    this.game.load.json('jsony', PlayersJson);
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
    if (!window.isMobile) this.scale.setResizeCallback(this.scaleGame);
    this.input.maxPointers = 1;
    this.scaleGame();
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

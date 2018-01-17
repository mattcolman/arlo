import Phaser from 'phaser';
import mergeWith from 'lodash/mergeWith';
import ManifestLoader from 'phaser-manifest-loader';
import Main from './Main';
import { customizer } from '../utils';

const req = require.context('../../assets', true, /.*\.png|json|ttf|woff|woff2|xml|mp3|jpg|jpeg$/);

const baseManifest = {
  audio: [
    'click',
    'spin',
    'select',
    'stick',
    'reaction',
    'super_success',
  ],
  spritesheets: [
    'symbols',
    'coins',
    'splitters',
  ],
  images: [
    'reel',
    'bg_reel_tile',
    'star_particle',
    'shadow',
    'free_tickets',
  ],
  bitmap_fonts: [
    'avenir_white',
    'digital_red',
  ],
};

const desktopManifest = {
  images: [
    'crank_piece',
  ],
  spritesheets: [
    'crank',
  ],
};

const mobileManifest = {
  spritesheets: [
    'red_button',
  ],
};

export default class extends Phaser.State {

  create() {
    console.log('boot me up');
    const { isDesktop } = this.game.props;
    // don't render anything until all assets are loaded
    // the canvas is transparent so you can show a loader behind it
    // in the parent app
    const fullManifest = mergeWith(
      baseManifest,
      (isDesktop ? desktopManifest : mobileManifest),
      customizer
    );
    const loader = this.game.plugins.add(ManifestLoader, req);
    loader.loadManifest(fullManifest).then(() => {
      setTimeout(() => {
        this.setupStage();
        this.addStates();
        this.startGame();
      }, 2000)
    });
    this.game.manifestLoader = loader;
  }

  setupStage() {
    const { isDesktop } = this.game.props;
    this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    if (isDesktop) this.scale.setResizeCallback(this.scaleGame);
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

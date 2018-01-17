import mergeWith from 'lodash/mergeWith';
import ManifestLoader from 'phaser-manifest-loader';
import Phaser from 'phaser';
import Victory from './Victory';
import { customizer } from '../utils';

const req = require.context('../../assets', true, /.*\.png|json|ttf|woff|woff2|xml|mp3|jpg|jpeg$/);

const baseManifest = {
  audio: [
    'success',
  ],
  spritesheets: [
    'light',
    'play_btn',
  ],
  images: [
    'victory',
    'nba',
    'trophy',
  ],
  bitmap_fonts: [
  ],
  fonts: {
    custom: {
      families: [
        'Avenir',
      ],
    },
  },
};

const desktopManifest = {
  images: [
    'victory_back',
    'victory_coins',
  ],
};

const mobileManifest = {
  images: [
    'victory_back_mobile',
    'victory_coins_mobile',
  ],
};

export default class extends Phaser.State {

  create() {
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
      this.setupStage();
      this.addStates();
      // this.startGame();
    });
  }

  setupStage() {
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.input.maxPointers = 1;
    this.scale.refresh();
  }

  addStates() {
    this.state.add('Victory', Victory);
  }

  startGame() {
    this.state.start('Victory');
  }

}

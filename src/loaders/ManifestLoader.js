import WebFont from 'webfontloader';

import 'assets/fonts/panton/stylesheet.css';

import AssetLoader from './AssetLoader';

const {
  Phaser,
} = window;

class ManifestLoader extends Phaser.Plugin {

  init() {
  }

  destroy() {
    super.destroy();
  }

  loadManifest(manifest) {
    this.assetLoaderPromise = this._loadAssets(manifest);
    const webFontPromise    = this._loadWebFonts(manifest.fonts);
    return Promise.all([
      this.assetLoaderPromise,
      webFontPromise,
    ]);
  }

  _loadAssets(manifest) {
    return new Promise((resolve) => {
      const assetLoader = this.game.plugins.add(AssetLoader, '');
      assetLoader.loadManifest(manifest);
      this.game.load.onLoadComplete.addOnce(() => {
        this.game.plugins.remove(assetLoader);
        resolve();
      });
      this.game.load.start();
    });
  }

  _loadWebFonts(fonts) {
    return new Promise((resolve) => {

      console.log('load fontFamilies', fonts);

      // converted from FontSquirrel.com
      WebFont.load({
        // google: {
        //   families: ['Droid Sans', 'Droid Serif']
        // },
        custom: {
          families: fonts,
        },
        active: () => {
          // this.game.time.events.add(Phaser.Timer.SECOND, this.fontLoadComplete, this)
          console.log('fonts loaded!');
          resolve(fonts);
        },

      });
    });
  }
}

export default ManifestLoader;

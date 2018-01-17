// NOTE
// using requireAll and require.context would be super cool. It would import
// all assets in a directory by file-type, then we could dynamically look them
// up in the helper functions below. However, require.context is undefined for
// whatever reason. I believe require.context is only available on client-side require...?

// ALSO NOTE
// require can dynamically create a context by using a basic string in the require method
// for example `require('./directory/${variable}.png`
// require can find the directory and filetype and create a context.
// However if you get too clever and provide the directory or filetype as a variable the context
// will not be created and it will instead use the app context (which is bad!!!)
//
// You could also use Webpack.ContextReplacementPlugin for more control over contexts
//

const {
  Phaser,
} = window;

class AssetLoader extends Phaser.Plugin {

  init(assetPostfix = '') {
    // this.game.load.crossOrigin = 'anonymous';
    this.assetPostfix = assetPostfix;
    this.loaders = {
      audio: this.loadAudio,
      animations: this.loadAnimation,
      images: this.loadImage,
      bitmap_fonts: this.loadBitmapFont,
    };
  }

  destroy() {
    this.loaders = null;
    super.destroy();
  }

  loadManifest(manifest) {
    console.log('loadManifest');
    Object.keys(this.loaders).forEach((assetType) => {
      const assets = manifest[assetType];
      if (!assets) return;
      assets.forEach((assetKey) => {
        this.loaders[assetType].call(this, assetKey);
      });
    });
  }

  loadAudio(key) {
    console.log('loadAudio', key);
    const url = require(`assets/audio/${key}.mp3`);
    this.game.load.audio(key, url);
  }

  loadAnimation(key) {
    console.log('loadAnimation', key)
    const imageUrl = require(`assets/animations/${key}${this.assetPostfix}.png`);
    const jsonUrl = require(`assets/animations/${key}${this.assetPostfix}.json`);
    this.game.load.atlasJSONArray(key, imageUrl, null, jsonUrl)
  }

  loadImage(key) {
    console.log('loadImage', key)
    let url
    try {
      url = require(`assets/images/${key}${this.assetPostfix}.jpg`);
    } catch (e) {
      url = require(`assets/images/${key}${this.assetPostfix}.png`);
    }
    this.game.load.image(key, url);
  }

  loadBitmapFont(key) {
    console.log('loadBitmapFont', key)
    const imageUrl = require(`assets/bitmap_fonts/${key}${this.assetPostfix}.png`);
    const jsonData = require(`assets/bitmap_fonts/${key}${this.assetPostfix}.json`);
    this.game.load.bitmapFont(key, imageUrl, null, JSON.stringify(jsonData));
  }

}

export default AssetLoader

import Phaser from 'phaser';
import 'gsap';

const { TweenMax, TimelineMax, Linear, PIXI } = window;

const Debug = {
  config: {
    fps: false,
  },
};

export default class extends Phaser.State {
  create() {
    this.initSounds();

    const main = this.add.image(0, 0, 'main')

    const dvds = this.add.button(200, 190, 'sprites', this.handleBooksClick, this, 'dvds_selected', 'dvds', 'dvds_selected', 'dvds')

    const books = this.add.button(428, 338, 'sprites', this.handleBooksClick, this, 'books_selected', 'books', 'books_selected', 'books')

    this.addCircles();

    if (Debug.config.fps) {
      this.game.time.advancedTiming = true;
      this.fpsTxt = this.game.add.text(50, 20, this.game.time.fps || '--', {
        font: '24px Arial',
        fill: '#00ff00',
      });
    }

    // window.Game = this;

    super.create();
  }

  handleBooksClick() {

  }

  addCircles() {
    const numCircles = 5;
    const colors = [0xf82959, 0xfb8337, 0xffe051, 0x1ad3b4, 0x01a2d9];
    const angle = Math.PI * 0.2;
    const distance = 200;
    for (let i = 0; i < numCircles; i++) {
      const g = this.game.add.graphics(
        665 + Math.sin(1.2 + angle * (i + 1)) * distance,
        320 + Math.cos(1.2 + angle * (i + 1)) * distance,
      );
      g.beginFill(colors[i]);
      g.drawCircle(0, 0, 30);
      g.endFill();
      TweenMax.to(g.scale, 0.8, {
        x: 0.5,
        repeat: -1,
        yoyo: true,
        ease: Quad.easeInOut,
        delay: i * 0.1,
      });
      TweenMax.to(g.scale, 0.8, {
        y: 0.5,
        repeat: -1,
        yoyo: true,
        ease: Quad.easeInOut,
        delay: i * 0.1 + 0.15,
      });
    }
  }

  initSounds() {
    const sounds = [];
    this.slotSoundsHash = sounds.reduce(
      (memo, id) => ({
        ...memo,
        [id]: this.game.sound.add(id),
      }),
      {},
    );

    //  Being mp3 files these take time to decode, so we can't play them instantly
    //  Using setDecodedCallback we can be notified when they're ALL ready for use.
    //  The audio files could decode in ANY order, we can never be sure which it'll be.
    this.game.sound.setDecodedCallback(Object.values(this.slotSoundsHash), () => {}, this);
  }

  update() {
    if (Debug.config.fps) {
      this.fpsTxt.text = this.game.time.fps; // debug text doesn't work with the canvas renderer??
      this.fpsTxt.bringToTop();
    }
  }

  shutdown() {
    TweenMax.killAll();
  }
}

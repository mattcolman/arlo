import Phaser from 'phaser';
import chunk from 'lodash/chunk';
import map from 'lodash/map';
import 'gsap';
import { ListView } from 'phaser-list-view';

const { TweenMax, TimelineMax, Linear, PIXI } = window;

const Debug = {
  config: {
    fps: false,
  },
};

export default class extends Phaser.State {
  create() {
    this.initSounds();
    window.fetch('/config.json').then(res => res.json()).then((json) => {
      this.config = json;
      this.config.photos.forEach((photo, i) => {
        this.load.image(`photo${i + 1}`, photo);
      });
      this.load.onLoadComplete.addOnce(() => {
        this.createGame();
      });
      this.load.start();
    });

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

  createGame() {
    const main = this.add.image(0, 0, 'main');

    const arlo = this.add.image(this.world.centerX, this.world.height, 'arlo');
    arlo.anchor.set(0.5, 1);

    this.addPhotos();

    const dvds = this.add.button(200, 190, 'sprites', this.handleDvdsClick, this, 'dvds_selected', 'dvds', 'dvds_selected', 'dvds');
    const books = this.add.button(428, 338, 'sprites', this.handleBooksClick, this, 'books_selected', 'books', 'books_selected', 'books');
    const toys = this.add.button(1000, 380, 'sprites', this.handleToysClick, this, 'toys_selected', 'toys', 'toys_selected', 'toys');
  }

  addPhotos() {
    const positions = [
      { x: 892, y: 163 },
      { x: 1001, y: 111 },
      { x: 1103, y: 176 },
      { x: 1210, y: 130 },
    ];

    const maxWidth = 75;
    const maxHeight = 92;
    for (let i = 0; i < 4; i++) {
      const { x, y } = positions[i];
      const img = this.add.image(x, y, `photo${i + 1}`);
      img.width = maxWidth;
      img.scale.y = img.scale.x;
      if (img.height > maxHeight) {
        img.height = maxHeight;
        img.scale.x = img.scale.y;
      }
      img.data.orgWidth = img.width;
      img.data.orgHeight = img.height;
      img.data.orgX = img.x;
      img.data.orgY = img.y;
      img.anchor.set(0.5);
      img.inputEnabled = true;
      img.events.onInputUp.add(this.toggleImageClick, this);
    }
  }

  toggleImageClick(img) {
    if (img.width === img.data.orgWidth) {
      this.expandImage(img);
    } else {
      this.contractImage(img);
    }
  }

  expandImage(img) {
    const width = 600;
    const currentScale = img.scale.x;
    img.width = width;
    img.scale.y = img.scale.x;
    img.bringToTop();
    TweenMax.from(img.scale, 0.5, { x: currentScale, y: currentScale, ease: Strong.easeOut });
    TweenMax.to(img, 0.5, { x: this.world.centerX, y: this.world.centerY, ease: Strong.easeOut });
  }

  contractImage(img) {
    const { orgX, orgY, orgWidth, orgHeight } = img.data;
    TweenMax.to(img, 0.5, { x: orgX, y: orgY, width: orgWidth, height: orgHeight, ease: Strong.easeOut });
  }

  handleBooksClick() {
    this.loadImages(this.config.books);
  }

  handleDvdsClick() {
    this.loadImages(this.config.dvds);
  }

  handleToysClick() {
    this.loadImages(this.config.toys);
  }

  loadImages(data) {
    data.forEach((item) => {
      this.game.load.image(item.name, item.imageUri);
    });
    this.game.load.onLoadComplete.addOnce(() => {
      this.createGrid(data);
    });
    this.game.load.start();
  }

  createGrid(data) {
    const maxWidth = 250;
    const maxHeight = 250;
    const padding = 10;
    const numColumns = 5;
    const rows = chunk(data, numColumns);
    const listView = new ListView(
      this.game,
      this.world,
      new Phaser.Rectangle(0, 0, this.world.width, this.world.height),
      { padding: 20 },
    );
    rows.forEach((row, j) => {
      const rowGrp = this.add.group();
      row.forEach((dvd, i) => {
        const img = this.add.image(i * (maxWidth + padding) + 165, 160, dvd.name, null, rowGrp);
        img.width = maxWidth;
        img.scale.y = img.scale.x;
        if (img.height > maxHeight) {
          img.height = maxHeight;
          img.scale.x = img.scale.y;
        }
        img.anchor.set(0.5);
        const tl = new TimelineMax({ delay: j * 0.5 + i * 0.1 });
        tl.from(img, 0.8, { rotation: 1, y: '+=200', ease: Strong.easeOut, alpha: 0 });
          // .from(img.scale, 1, { x: 0.5, y: 0.5, ease: Strong.easeOut }, 0);
      });
      listView.add(rowGrp);
    });
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

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

  isThoughtTweening = false;

  create() {
    this.cache = {};
    this.config = this.game.config;
    // this.initSounds();
    this.createGame();

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
    this.add.image(0, 0, 'main');

    this.addPhotos();

    this.arlo = this.add.group();
    this.arlo.position.set(this.world.centerX, this.world.height);
    const head = this.add.image(0, 0, 'arlo', null, this.arlo);
    head.anchor.set(0.5, 1);
    head.inputEnabled = true;
    head.events.onInputUp.add(this.handleArloClick, this);

    this.dvds = this.add.button(200, 190, 'sprites', this.handleDvdsClick, this, 'dvds_selected', 'dvds', 'dvds_selected', 'dvds');
    const books = this.add.button(428, 338, 'sprites', this.handleBooksClick, this, 'books_selected', 'books', 'books_selected', 'books');
    const toys = this.add.button(1000, 380, 'sprites', this.handleToysClick, this, 'toys_selected', 'toys', 'toys_selected', 'toys');
    const globe = this.add.button(200, 430, 'sprites', this.handleGlobeClick, this, 'globe_selected', 'globe', 'globe_selected', 'globe');

    this.white = this.add.graphics();
    this.white.beginFill(0xffffff)
     .drawRect(0, 0, this.world.width, this.world.height);
    this.white.alpha = 0;
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
    this.game.add.audio('click_slip').play();
    if (img.width === img.data.orgWidth) {
      this.expandImage(img);
    } else {
      this.contractImage(img);
    }
  }

  expandImage(img) {
    const width = this.world.width;
    const currentScale = img.scale.x;
    img.width = width;
    img.scale.y = img.scale.x;
    if (img.height > this.world.height) {
      img.height = this.world.height;
      img.scale.x = img.scale.y;
    }
    img.bringToTop();
    TweenMax.from(img.scale, 0.5, { x: currentScale, y: currentScale, ease: Strong.easeOut });
    TweenMax.to(img, 0.5, { x: this.world.centerX, y: this.world.centerY, ease: Strong.easeOut });
  }

  contractImage(img) {
    const { orgX, orgY, orgWidth, orgHeight } = img.data;
    TweenMax.to(img, 0.5, { x: orgX, y: orgY, width: orgWidth, height: orgHeight, ease: Strong.easeOut });
  }

  handleArloClick() {
    if (this.circlesGrp) return;
    this.game.add.audio('blup').play();
    this.world.addChild(this.arlo);
    const arloHeadLookUp = this.add.image(-110, -590, 'arlo-look-up', null, this.arlo);
    TweenMax.from(arloHeadLookUp, 0.5, { alpha: 0, ease: Strong.easeOut });
    TweenMax.to(this.white, 0.5, { alpha: 0.5 });
    TweenMax.to(this.arlo.scale, 0.5, { x: 1.4, y: 1.4, ease: Strong.easeOut });
    TweenMax.to(this.arlo, 0.5, { y: '+=250', ease: Strong.easeOut });
    this.addCircles();

    const closeBtn = this.add.button(10, 10, 'sprites', () => {
      this.game.add.audio('fart').play();
      const index = this.world.getChildIndex(this.dvds);
      this.world.setChildIndex(this.arlo, index);
      TweenMax.killAll();
      TweenMax.to(this.white, 0.5, { alpha: 0 });
      TweenMax.to(this.arlo.scale, 0.5, { x: 1, y: 1, ease: Strong.easeOut });
      TweenMax.to(this.arlo, 0.5, { y: this.world.height, ease: Strong.easeOut });
      this.circlesGrp.destroy();
      this.circlesGrp = null;
      this.arlo.removeChild(arloHeadLookUp);
      closeBtn.destroy();
    }, this, 'closebtn', 'closebtn', 'closebtn', 'closebtn');
  }

  handleGlobeClick() {
    this.loadImages('places_visited', this.config.places_visited);
  }

  handleBooksClick() {
    this.loadImages('books', this.config.books);
  }

  handleDvdsClick() {
    this.loadImages('dvds', this.config.dvds);
  }

  handleToysClick() {
    this.loadImages('toys', this.config.toys);
  }

  loadImages(cacheKey, data) {
    this.game.add.audio('blup').play();
    const maxWidth = 230;
    const maxHeight = 230;

    const g = this.add.graphics();
    g.beginFill(0xffffff)
     .drawRect(0, 0, this.world.width, this.world.height);
    g.alpha = 0.7;
    const groups = this.createGridItems(data);

    const closeBtn = this.add.button(10, 10, 'sprites', () => {
      this.game.add.audio('fart').play();
      this.game.load.onFileComplete.removeAll();
      this.listView.destroy();
      g.destroy();
      closeBtn.destroy();
    }, this, 'closebtn', 'closebtn', 'closebtn', 'closebtn');

    data.forEach((item) => {
      this.game.load.image(item.name, item.imageUri);
    });
    this.game.load.onFileComplete.add((progress, fileKey, success, totalLoaded, totalFiles) => {
      const grp = groups.find(_grp => _grp.item.name === fileKey);
      // remove placeholder loader and replace with image
      grp.removeAll();
      const item = grp.item;
      const img = this.add.image(0, 0, fileKey, null, grp);
      if (item.link) {
        img.inputEnabled = true;
        img.events.onInputUp.add(() => {
          window.open(item.link, '_blank');
        });
      }
      img.width = maxWidth;
      img.scale.y = img.scale.x;
      if (img.height > maxHeight) {
        img.height = maxHeight;
        img.scale.x = img.scale.y;
      }
      img.anchor.set(0.5);
      TweenMax.from(img, 0.8, { alpha: 0 });
    });
    this.game.load.start();
  }

  createGridItems(data) {
    const maxWidth = 230;
    const maxHeight = 230;
    const padding = 20;
    const numColumns = 5;
    const rows = chunk(data, numColumns);
    const items = [];
    this.listView = new ListView(
      this.game,
      this.world,
      new Phaser.Rectangle(20, 60, this.world.width - 40, this.world.height - 60),
      { padding: 20, searchForClicks: true },
    );
    rows.forEach((row, j) => {
      const rowGrp = this.add.group();
      row.forEach((item, i) => {
        const grp = this.add.group(rowGrp);
        grp.position.set(i * (maxWidth + padding) + 165, 160);
        grp.item = item;
        items.push(grp);
        TweenMax.from(grp, 0.5, { delay: i * 0.1 + j * 0.5, angle: 60, y: '+=200', ease: Strong.easeOut, alpha: 0 });

        // show placeholder loader
        const g = this.game.add.graphics(0, 0, grp);
        g.beginFill(0x333333)
         .drawRect(0, 0, maxWidth, maxHeight);
        g.pivot.set(maxWidth / 2, maxHeight / 2);
        g.alpha = 0.1;

        const spinner = this.game.add.image(0, 0, 'spinner', null, grp);
        spinner.anchor.set(0.5);
        spinner.width = 50;
        spinner.scale.y = spinner.scale.x;
        TweenMax.to(spinner, 2, { angle: 360, repeat: -1, ease: Linear.easeNone });
      });
      this.listView.add(rowGrp);
    });

    return items;
  }

  addCircles() {
    const numCircles = 5;
    const colors = [0xf82959, 0xfb8337, 0xffe051, 0x1ad3b4, 0x01a2d9];
    const angle = Math.PI * 0.2;
    const distance = 200;
    this.circlesGrp = this.add.group();
    for (let i = 0; i < numCircles; i++) {
      const grp = this.add.group(this.circlesGrp);
      grp.position.set(
        685 + Math.sin(1.2 + angle * (numCircles - i)) * distance,
        320 + Math.cos(1.2 + angle * (numCircles - i)) * distance,
      );
      grp.data = {
        orgX: grp.x,
        orgY: grp.y,
      };
      grp.scale.set(0.1);
      const g = this.game.add.graphics(0, 0, grp);
      g.beginFill(colors[i]);
      g.drawCircle(0, 0, 600);
      g.endFill();
      g.inputEnabled = true;
      g.events.onInputUp.add(() => {
        this.handleThoughtClicked(grp, this.config.thoughts[i]);
      });
      TweenMax.to(g.scale, 0.8, {
        x: 0.9,
        repeat: -1,
        yoyo: true,
        ease: Quad.easeInOut,
        delay: i * 0.1,
      });
      TweenMax.to(g.scale, 0.8, {
        y: 0.9,
        repeat: -1,
        yoyo: true,
        ease: Quad.easeInOut,
        delay: i * 0.1 + 0.15,
      });
    }
  }

  handleThoughtClicked(grp, thought) {
    if (!thought || this.isThoughtTweening) return;
    this.game.add.audio('blop').play();
    if (grp.scale.x === 1) {
      this.contractThought(grp);
    } else {
      this.expandThought(grp, thought);
    }
  }

  expandThought(grp, thought) {
    this.isThoughtTweening = true;
    TweenMax.killTweensOf(grp.scale);
    this.circlesGrp.addChild(grp);
    TweenMax.to(grp, 0.5, {
      x: this.world.centerX,
      y: this.world.centerY,
      ease: Strong.easeOut,
    });
    TweenMax.to(grp.scale, 0.5, {
      x: 1,
      y: 1,
      ease: Strong.easeOut,
      onComplete: this.handleThoughtAnimationComplete,
      onCompleteScope: this,
    });
    const title = this.add.bitmapText(0, -200, 'arnold', thought.title.toUpperCase(), 50, grp);
    title.maxWidth = 350;
    title.align = 'center';
    title.anchor.x = 0.5;
    if (thought.imageUri) {
      this.load.image(thought.title, thought.imageUri);
      this.load.onLoadComplete.addOnce(() => {
        const img = this.add.image(0, 0, thought.title, null, grp);
        img.anchor.set(0.5);
        img.width = 280;
        img.scale.y = img.scale.x;
      });
      this.load.start();
    } else {
      const body = this.add.bitmapText(0, title.y + title.height + 50, 'arnold', thought.body.toUpperCase(), 40, grp);
      body.maxWidth = 350;
      body.align = 'center';
      body.anchor.x = 0.5;
    }
  }

  contractThought(grp) {
    const { orgX, orgY } = grp.data;
    this.load.onLoadComplete.removeAll();
    this.isThoughtTweening = true;
    while (grp.children.length > 1) {
      grp.removeChildAt(1);
    }
    TweenMax.to(grp.scale, 0.5, { x: 0.1, y: 0.1, ease: Strong.easeOut });
    TweenMax.to(grp, 0.5, { x: orgX, y: orgY, ease: Strong.easeOut, onComplete: this.handleThoughtAnimationComplete, onCompleteScope: this });
  }

  handleThoughtAnimationComplete() {
    this.isThoughtTweening = false;
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

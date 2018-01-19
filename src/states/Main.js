import Phaser from 'phaser';
import sample from 'lodash/sample';
import get from 'lodash/get';
import take from 'lodash/take';
import times from 'lodash/times';
import without from 'lodash/without';
import fill from 'lodash/fill';
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';
import mapValues from 'lodash/mapValues';
import random from 'lodash/random';
import reduce from 'lodash/reduce';
import shuffle from 'lodash/shuffle';
import 'gsap';
import Reel from '../groups/Reel';
import { TILE_WIDTH, TILE_HEIGHT, SPACING } from '../constants';
import ValueTweener from '../ValueTweener';
import Pool from '../pool';

const SPIN_DELAY = 0.2;
const { TweenMax, TimelineMax, Linear, Strong, PIXI } = window;

const Debug = {
  config: {
    fps: false,
  },
};

const NUM_ROWS = 3;
const NUM_COLUMNS = 5;

const Symbols = ['playchip', 'bball', 'football', 'baseball', 'cricket', 'soccer'];
// const Symbols = ['playchip', 'bball'];

// const Lines = [[0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2], [0, 1, 2, 1, 0], [2, 1, 0, 1, 2]];
// const Lines = [[0, 0, 0, 0, 0], [1, 1, 1, 1, 1], [2, 2, 2, 2, 2]];
const Lines = [[0, 1, 2, 1, 0]];

function getResults(isWin) {
  const randomLines = times(NUM_COLUMNS, () =>
    times(NUM_ROWS, () => sample(without(Symbols, 'playchip'))),
  );
  // const numPlaychips = isWin ? sample([3, 4, 5]) : 2;
  const numPlaychips = 4;
  const nulls = shuffle([
    ...times(NUM_COLUMNS - numPlaychips, () => true),
    ...times(numPlaychips, () => false),
  ]);
  const winningLine = sample(Lines).map((line, i) => (nulls[i] ? null : line));
  randomLines.forEach((line, i) => {
    if (winningLine[i] !== null) {
      line[winningLine[i]] = 'playchip';
    }
  });
  return randomLines;
}

export default class extends Phaser.State {
  create() {
    this.valueTweener = new ValueTweener();
    this.pool = new Pool();
    this.payoutTimer = new Phaser.Signal();

    this.game.scale.leaveIncorrectOrientation.add(() => {
      window.location.reload();
    });

    this.addBackground();

    this.addSlots();

    if (Debug.config.fps) {
      this.game.time.advancedTiming = true;
      this.fpsTxt = this.game.add.text(50, 20, this.game.time.fps || '--', {
        font: '24px Arial',
        fill: '#00ff00',
      });
    }

    super.create();
  }

  update() {
    if (Debug.config.fps) {
      this.fpsTxt.text = this.game.time.fps; // debug text doesn't work with the canvas renderer??
      this.fpsTxt.bringToTop();
    }
  }

  shutdown() {
    TweenMax.killAll();
    this.payoutTimer.dispose();
  }

  addBackground() {
    this.game.add.image(0, 0, 'background');
    this.addBlueSparkles(new Phaser.Rectangle(0, 360, this.world.width, 100));
  }

  addSlots() {
    this.fullReelGrp = this.add.group(this.world, 'full-reel-group');

    const NUM_REELS = 5;
    const w = (TILE_WIDTH + SPACING) * NUM_REELS;
    const h = (TILE_HEIGHT + SPACING) * 3 - SPACING;

    const REEL_Y = 44;

    // add backing
    const backing = this.addBacking(this.fullReelGrp, w + 5, h + REEL_Y + 5);

    const reelGrp = this.add.group(this.fullReelGrp, 'reel-group');
    reelGrp.position.set(5, REEL_Y);

    this.reels = times(NUM_REELS, i => this.addReel(reelGrp, i * (TILE_WIDTH + SPACING), 0));

    // add mask
    const rect = this.make.graphics(0, 0);
    rect.beginFill(0xff0000, 1);
    rect.drawRect(0, 0, w, h);
    reelGrp.addChild(rect);
    reelGrp.mask = rect;

    this.spinBtn = this.addButton(
      this.world,
      this.world.width - 300,
      this.world.height - 150,
      'spin',
      this.spin,
    );

    this.fullReelGrp.position.set((this.world.width - backing.width) / 2, 30);
  }

  spin() {
    this.spinBtn.disable();
    this.game.add.sound('click').play();
    this.spinSnd = this.game.add.sound('spin', 1, true);
    this.spinSnd.play();

    // TODO request results from the backend
    const results = getResults(Math.random() > 0.5);

    const tl = new TimelineMax();
    this.reels.forEach((reel, i) => tl.call(reel.spin, [], reel, i * SPIN_DELAY));
    tl.call(this.stop, [results], this, 2);
  }

  stop(results) {
    console.log('stop', results);
    const promises = this.reels.map(
      (reel, i) =>
        new Promise(resolve =>
          TweenMax.delayedCall(i * SPIN_DELAY, () => {
            reel.requestStop(results[i], () => {
              this.analyzeResults(results, i);
              resolve();
            });
          }),
        ),
    );
    Promise.all(promises).then(() => this.handleSpinsComplete());
  }

  analyzeResults(results, currentColumn) {
    // const activePlaychips = map the results to only display active playchips
    const lines = this.scanLines(take(results, currentColumn + 1), currentColumn);
    if (lines.length > 0) {
      if (results[currentColumn].includes('playchip')) {
        this.game.add.audio('select').play();
      }
    } else {
      this.game.add.audio('stick').play();
    }
    lines.forEach((line) => {
      take(this.reels, currentColumn + 1).forEach((reel, column) => {
        times(NUM_ROWS, (row) => {
          if (line[column]) {
            reel.getCard(row).playCurrentAnimation();
          }
        });
      });
    });
  }

  scanLines(results, i) {
    if (i === 0) return [];
    const mappedLines = Lines.map(line =>
      line.map((column, j) => (results[j] && results[j][column]) === 'playchip'),
    );
    return mappedLines;
  }

  handleSpinsComplete() {
    this.spinSnd.stop();
    this.spinBtn.enable();
  }

  /* -------------------------------------------------------
    -- PRIVATE
    ------------------------------------------------------- */

  addBlueSparkles(bounds) {
    const numParticles = 100;
    times(numParticles).map(() => this.addSingleBlueParticle(bounds.random()));
  }

  addSingleBlueParticle(pt) {
    const p = this.game.add.image(pt.x, pt.y, 'blue_particle');
    p.scale.set(random(0.3, 0.7));
    p.alpha = random(0.2, 1);
    p.blendMode = PIXI.blendModes.ADD;
    this.sparkleMe(p);
  }

  sparkleMe(p) {
    TweenMax.to(p, random(0.15, 0.35), {
      alpha: random(0.2, 1),
      delay: random(0, 1),
      repeat: 1,
      yoyo: true,
      onComplete: this.sparkleMe,
      onCompleteParams: [p],
      onCompleteScope: this,
    });
  }

  addBacking(parent, w, h) {
    const g = this.game.add.graphics(0, 0, parent);
    g.beginFill(0xfed700).drawRect(0, 0, w, h);
    return g;
  }

  addButton(parent, x, y, key, callback) {
    // const grp = this.game.add.group(parent);
    // grp.position.set(x, y);
    const btn = this.game.add.button(
      x,
      y,
      'assets',
      callback,
      this,
      key,
      key,
      `${key}_down`,
      key,
      parent,
    );

    btn.disable = () => {
      btn.inputEnabled = false;
      btn.alpha = 0.2;
    };

    btn.enable = () => {
      btn.inputEnabled = true;
      btn.alpha = 1;
    };

    return btn;
  }

  autoSparkle(grp, options = {}) {
    const numParticles = options.numParticles || 2;
    times(numParticles).map(() =>
      TweenMax.delayedCall(random(0, 3), () => this.addStarParticle(grp)),
    );
  }

  addStarParticle(parent) {
    const p = this.pool.remove('star_particle', () => {
      const img = this.game.make.image(0, 0, 'star_particle');
      img.anchor.set(0.5);
      return img;
    });
    const duration = random(1.2, 2.2);
    const spacing = 10;
    parent.addChild(p);
    p.position.set(
      random(spacing, parent.width - spacing),
      random(spacing, parent.height - spacing),
    );
    p.scale.x = p.scale.y = 0;
    p.rotation = 0;
    const scale = random(0.8, 1.5);
    const tl = new TimelineMax({
      onComplete: () => {
        this.pool.add('star_particle', p);
        TweenMax.delayedCall(random(0, 2), () => {
          this.addStarParticle(parent);
        });
      },
    });
    tl
      .to(p.scale, duration / 2, { x: scale, y: scale, repeat: 1, yoyo: true })
      .to(p, duration, { angle: random(40, 100), ease: Linear.easeNone }, 0);
  }

  addReel(parent, x, y) {
    const reel = new Reel(this.game, Symbols);
    reel.position.set(x, y);
    parent.addChild(reel);
    return reel;
  }
}

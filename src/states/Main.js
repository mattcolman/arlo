import Phaser from 'phaser';
import sample from 'lodash/sample';
import times from 'lodash/times';
import last from 'lodash/last';
import sortBy from 'lodash/sortBy';
import mapValues from 'lodash/mapValues';
import random from 'lodash/random';
import reduce from 'lodash/reduce';
import shuffle from 'lodash/shuffle';
import 'gsap';
import Reel from '../groups/Reel';
import { decodePlayer, dollarize } from '../utils';
import { TILE_WIDTH, TILE_HEIGHT, SPACING } from '../constants';
import ValueTweener from '../ValueTweener';
import Pool from '../pool';
import * as Font from '../Font';
import * as Color from '../Color';

const SPIN_DELAY = 0.2;
const SALARY_CAP = 43000000; // salary is just higher than the highest possible salary
const { TweenMax, TimelineMax, Linear, Strong, PIXI } = window;

const Debug = {
  config: {
    fps: false,
  },
};

// const Symbols = ['symbols', 'bball', 'football', 'baseball', 'cricket', 'soccer'];
const Symbols = ['symbols', 'bball', 'football'];

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

    this.bottomBar = this.addBottomBar();

    const padding = 80;
    const availableSpace = this.world.height - this.bottomBar.height - padding;
    const defaultSpace = TILE_HEIGHT * 3 + 20;

    this.fullReelGrp.scale.y = this.fullReelGrp.scale.x = availableSpace / defaultSpace;
    const offsetX = backing.width * this.fullReelGrp.scale.x / 2;
    const offsetY = backing.height * this.fullReelGrp.scale.y / 2;
    this.fullReelGrp.pivot.set(backing.width / 2, backing.height / 2);
    this.fullReelGrp.position.set(
      (this.world.width - backing.width * this.fullReelGrp.scale.x) / 2 + offsetX,
      10 + offsetY,
    );
  }

  spin() {
    this.spinBtn.disable();
    this.enterChallengeBtn.disable();
    this.game.add.sound('click').play();
    this.spinSnd = this.game.add.sound('spin', 1, true);
    this.spinSnd.play();
    const results = times(5, sample(Symbols));
    const tl = new TimelineMax();
    this.reels.forEach((reel, i) => tl.call(reel.spin, [], reel, i * SPIN_DELAY));
    tl.call(this.stop, [results], this, 2);
  }

  stop(results) {
    this.lineup = reduce(results, (memo, arr) => [...memo, arr[1]], []);
    const promises = this.reels.map(
      (reel, i) =>
        new Promise(resolve =>
          TweenMax.delayedCall(i * SPIN_DELAY, () => {
            reel.requestStop(results[reel.name], () => resolve());
          }),
        ),
    );
    Promise.all(promises).then(() => this.handleSpinsComplete());
  }

  handleSpinsComplete() {
    this.spinSnd.stop();
    this.renderSalaryBar();
    this.spinBtn.enable();
    this.enterChallengeBtn.enable();
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

  addBottomBar() {
    const grp = this.game.add.group(this.world);
    const halfBar = this.game.make.image(0, 0, 'assets', 'half_bottom_bar');

    const middleGrp = this.game.add.group(grp);
    middleGrp.position.set(halfBar.width - 16, 4);
    const middle = this.game.add.sprite(0, 0, 'assets', 'blue_middle', middleGrp);
    middle.height = 85;
    this.addPayout(middleGrp, middleGrp.width / 2, 10);

    // light sweep
    const lightSweep = this.game.add.image(-200, 0, 'assets', 'light_sweep', middleGrp);
    lightSweep.alpha = 0.8;
    lightSweep.height = 85;
    lightSweep.height = middle.height;
    lightSweep.blendMode = PIXI.blendModes.ADD;
    TweenMax.to(lightSweep, 2, { x: 400, repeat: -1, ease: Linear.easeNone, repeatDelay: 5 });

    grp.addChild(halfBar);
    const halfBar2 = this.game.add.image(
      middleGrp.x + middle.width - 16,
      0,
      'assets',
      'half_bottom_bar',
      grp,
    );
    halfBar2.anchor.x = 1;
    halfBar2.scale.x = -1;
    grp.position.set((this.world.width - grp.width) / 2, this.world.height - 110);

    this.addSalaryBar(grp, 15, 13);
    this.spinBtn = this.addButton(grp, grp.width - 190, 6, 'spin', this.spin);
    this.autoSparkle(this.spinBtn);
    this.enterChallengeBtn = this.addButton(
      grp,
      grp.width - 380,
      6,
      'enter_challenge',
      this.enterChallengeClicked,
    );
    this.enterChallengeBtn.disable();
    return grp;
  }

  addSalaryBar(parent, x, y) {
    const grp = this.game.add.group(parent);
    grp.position.set(x, y);
    this.game.add.image(0, 0, 'assets', 'salary_back', grp);
    const titleTxt = this.game.add.bitmapText(20, 16, 'pantoon_white', 'SALARY CAP', 14, grp);
    titleTxt.alpha = 0.9;
    titleTxt.anchor.y = 0.5;
    const salaryTxt = this.game.add.bitmapText(
      340,
      15,
      'pantoon_white',
      dollarize(SALARY_CAP),
      18,
      grp,
    );
    salaryTxt.anchor.set(1, 0.5);

    // bar
    const g = this.game.add.graphics(13, 34, grp);
    const w = 340;
    const h = 26;
    g.beginFill(0x65db3b);
    g.drawRect(0, 0, w, h);
    g.scale.x = 0;

    // txt
    const txt = this.game.add.bitmapText(100, 34, 'pantoon_white', '', 18, grp);
    txt.anchor.x = 1;

    this.salaryBar = {
      bar: g,
      txt,
    };
  }

  renderSalaryBar() {
    const salaryCap = SALARY_CAP;
    const salary = this.lineup.reduce((memo, player) => memo + player.salary, 0);
    const percentageUsed = salary / salaryCap;
    this.valueTweener.tweenTo(
      1.5,
      percentageUsed,
      (value) => {
        this.salaryBar.bar.scale.x = value;
        this.salaryBar.txt.text = `${parseInt(value * 100, 10)}%`;
        this.salaryBar.txt.x = 4 + this.salaryBar.bar.width;
      },
      this,
    );
  }

  addPayout(parent, x, y) {
    this.payout = 1000;
    const style = { font: 'pantoon_white', size: 30 };
    this.payoutTxt = this.game.add.bitmapText(x, y, style.font, this.payout, style.size, parent);
    this.payoutTxt.anchor.set(0.5, 0);
    this.payoutTimer.add((value) => {
      this.payoutTxt.text = dollarize(value);
    });
    this.setPayoutAndRestartTimer();
  }

  setPayoutAndRestartTimer() {
    this.payout += 1;
    this.payoutTimer.dispatch(this.payout);
    TweenMax.delayedCall(random(0.2, 3), this.setPayoutAndRestartTimer, [], this);
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

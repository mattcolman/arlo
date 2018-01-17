import Phaser from 'phaser';
import without from 'lodash/without';
import times from 'lodash/times';
import uniq from 'lodash/uniq';
import shuffle from 'lodash/shuffle';
import get from 'lodash/get';
import sample from 'lodash/sample';
import random from 'lodash/random';
import moment from 'moment';
import 'moment-duration-format';
import Reel from '../groups/Reel';
import { TILE_WIDTH, SPACING } from '../constants';
import FlipCounter from '../FlipCounter';
import Counter from '../groups/Counter';
import Lock from '../Lock';
import { calculateRemainingTime } from '../utils';
import Debug from '../Debug';
import '../filters/Gray';
import State from '../State';

const { Linear } = window;

const SPIN_DELAY = 0.25;
const SYMBOLS = [
  'afl',
  'aleague',
  'nba',
  'epl',
  'nfl',
  'nrl',
  'odi',
  't20',
  // 'chest',
];
const NUM_REELS = 3;
function randomMiddleLine() {
  const firstPick = sample(SYMBOLS);
  // 50% chance of 2nd pick being same as first to make users think they could win
  const secondPick = Math.random() > 0.5 ? firstPick : sample(SYMBOLS);
  const lastPick = sample(without(SYMBOLS, firstPick));
  return [firstPick, secondPick, lastPick];
}

function generateAnticipationDelay() {
  return random(2, 4, true);
}

export default class extends State {
  create() {
    console.log('SlotMachine States');
    const { isDesktop, spinsRemaining, freeTicketsRemaining } = this.game.props;
    this.isLocked = spinsRemaining === 0 || freeTicketsRemaining === 0;
    this.grayFilter = this.add.filter('Gray');
    this.bmds = [];
    // this.addBackground();
    if (isDesktop) this.addBackCoins();
    this.addFreeTickets();
    this.addSlots();
    if (isDesktop) this.addFrontCoins();
    this.game.signals.componentDidUpdate.add(this.componentDidUpdate, this);

    if (Debug.config.fps) {
      this.game.time.advancedTiming = true;
      this.fpsTxt = this.game.add.text(50, 20, this.game.time.fps || '--', {
        font: '24px Arial',
        fill: '#00ff00',
      });
    }

    if (Debug.config.text) {
      this.debugTxt = this.game.add.text(50, 20, '--', {
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
    while (this.bmds.length > 0) {
      this.bmds.pop().destroy();
    }
    this.killAllTweens();
    if (this.interval) window.clearInterval(this.interval);
    if (this.timer) window.clearInterval(this.timer);
  }

  componentDidUpdate(prevProps) {
    console.log('old props', prevProps, 'new props', this.game.props);
    if (prevProps.spinCount !== this.game.props.spinCount) {
      this.handleReceivedResult(this.game.props.result);
    }
    if (prevProps.freeTicketsRemaining !== this.game.props.freeTicketsRemaining) {
      this.counter.flipToNumber(this.game.props.freeTicketsRemaining);
    }
    if (prevProps.spinsRemaining !== this.game.props.spinsRemaining) {
      this.spinCounter.setNumber(this.game.props.spinsRemaining);
    }
    if (
      (prevProps.spinsRemaining === 0 && this.game.props.spinsRemaining >= 1) ||
      (prevProps.freeTicketsRemaining === 0 && this.game.props.freeTicketsRemaining >= 1)
    ) {
      // show unlocked
      this.unlockSlots();
    }
    const locked =
      this.game.props.spinsRemaining === 0 || this.game.props.freeTicketsRemaining === 0;
    if (prevProps.showModal && !this.game.props.showModal) {
      if (locked) {
        // show locked
        this.lockSlots();
      } else {
        this.enableCrank();
      }
    }
  }

  updateSpins(spins) {
    if (this.props.spinsRemaining === 0 && spins >= 1) {
    }
    this.spinCounter.setNumber(spins);
  }

  addBackground() {
    const rect = this.add.graphics(0, 0);
    rect.beginFill(0xff0000, 0.2);
    rect.drawRect(0, 0, this.world.width, this.world.height);
  }

  addFreeTickets() {
    const { isDesktop, freeTicketsRemaining } = this.game.props;
    const x = isDesktop ? 280 : 180;
    const y = 0;
    this.add.image(x, y, 'free_tickets');
    this.counter = this.game.plugins.add(FlipCounter, {
      numDigits: 7,
      startNumber: freeTicketsRemaining,
    });
    const counterGrp = this.counter.getDisplayGroup();
    counterGrp.position.set(x + 21, y + 51);

    // simulate the counter
    // this.interval = setInterval(() => {
    //   counter.flipToNumber(counter.number + 1);
    // }, 1000);
  }

  addSlots() {
    const { isDesktop, freeTicketsRemaining, spinsRemaining } = this.game.props;
    const locked = spinsRemaining === 0 || freeTicketsRemaining === 0;

    this.fullReelGrp = this.add.group(this.world, 'full-reel-group');
    this.fullReelGrp.position.x = isDesktop ? 100 : 10;
    this.fullReelGrp.position.y = 115;
    const w = (TILE_WIDTH + SPACING) * NUM_REELS;
    const h = 263;

    const REEL_Y = -70;

    this.addReelBg(this.fullReelGrp, 40, 10);
    console.log('addReelBg', this.fullReelGrp.width);

    // add backing
    const backing = this.addBacking(this.fullReelGrp, 0, 0);

    if (isDesktop) {
      this.addDesktopButton();
    } else {
      this.addMobileButton();
    }
    if (locked) this.disableCrank(true);

    this.reelGrp = this.add.group(this.fullReelGrp, 'reel-group');
    this.reelGrp.position.set(56, REEL_Y);

    if (locked) {
      this.addLock();
    } else {
      this.reels = times(NUM_REELS).map(i =>
        this.addReel(`reel${i}`, this.reelGrp, 10 + i * (TILE_WIDTH + SPACING), 0),
      );

      // add splitters
      this.splitters = [
        this.add.image(225, 22, 'splitters', 'left', this.fullReelGrp),
        this.add.image(408, 22, 'splitters', 'right', this.fullReelGrp),
      ];

      // add shadows
      const shadowBmd = this.makeReelShadowBmd();
      this.addReelShadow(this.fullReelGrp, 50, 10, shadowBmd);
      const bottomShadow = this.addReelShadow(this.fullReelGrp, 50, backing.height - 20, shadowBmd);
      bottomShadow.scale.y = -1;
      backing.bringToTop();

      // add mask
      const rect = this.add.graphics(0, 10 - REEL_Y);
      rect.beginFill(0xff0000, 0.5);
      rect.drawRect(0, 0, w, h);
      this.reelGrp.addChild(rect);
      this.reelGrp.mask = rect;
    }

    this.spinCounter = new Counter(this.game, spinsRemaining, {
      style: { size: 44, font: 'digital_red' },
      numDigits: 2,
      spacing: 20,
    });
    this.spinCounter.position.set(backing.width - 41, 117);
    this.fullReelGrp.addChild(this.spinCounter);
  }

  disableCrank(greyOut = false) {
    if (greyOut) this.crank.filters = [this.grayFilter];
    this.crank.inputEnabled = false;
    this.crank.input.useHandCursor = false;
    this.highlight.visible = false;
  }

  enableCrank() {
    this.crank.filters = null;
    this.crank.inputEnabled = true;
    this.crank.input.useHandCursor = true;
    this.highlight.visible = true;
  }

  addDesktopButton() {
    const { spinsRemaining, freeTicketsRemaining } = this.game.props;
    const locked = spinsRemaining === 0 || freeTicketsRemaining === 0;
    this.add.image(this.fullReelGrp.width - 22, 50, 'crank_piece', null, this.fullReelGrp);
    this.crank = this.addCrank(this.fullReelGrp, this.fullReelGrp.width - 12, -75);
    if (!locked) {
      this.highlight = this.addCrankHighlight(this.fullReelGrp, this.fullReelGrp.width - 71, -22);
    }
  }

  addMobileButton() {
    const { spinsRemaining } = this.game.props;
    const x = this.fullReelGrp.width / 2 - 30;
    const y = this.fullReelGrp.height + 30;
    if (spinsRemaining > 0) {
      this.highlight = this.addRedButtonHighlight(this.fullReelGrp, x, y + 60);
    }
    this.crank = this.addRedButton(this.fullReelGrp, x, y);
  }

  addLock() {
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.p2.gravity.y = 1200;

    this.lockGrp = this.add.group(this.fullReelGrp);
    this.addLockText(this.lockGrp);

    this.lock = this.game.plugins.add(Lock, {
      parent: this.lockGrp,
    });
  }

  addAndTransitionInLock() {
    this.addLock();
    this.tweenMax().from(this.lockGrp, 1, { alpha: 0 });
  }

  transitionToLockedScreen() {
    this.tweenMax().to([this.reelGrp, ...this.splitters], 1, {
      alpha: 0,
      delay: 2,
      onComplete: this.addAndTransitionInLock,
      onCompleteScope: this,
    });
  }

  addLockText(parent) {
    const { spinsRemaining, unlockTime } = this.game.props;
    const x = 315;
    const str =
      spinsRemaining === 0 ? 'FREE SPIN IN' : 'No Free Tickets available.\nCome back soon!';
    const txt = this.game.add.text(
      x,
      70,
      str,
      {
        font: '26px Avenir',
        fill: '#12232b',
        align: 'center',
      },
      parent,
    );
    txt.anchor.set(0.5, 0);
    if (unlockTime) {
      const style = { size: 64, font: 'digital_red' };
      this.timeTxt = this.game.add.bitmapText(x, 100, style.font, '00:00:00', style.size, parent);
      this.timeTxt.anchor.set(0.5, 0);
      this.timer = setInterval(() => {
        const remainingTime = calculateRemainingTime(unlockTime);
        if (remainingTime <= 0) {
          this.handleFreeSpinTime();
        }
        this.setTime(remainingTime);
      }, 1000);
      this.setTime(calculateRemainingTime(unlockTime));
    }
  }

  handleFreeSpinTime() {
    window.clearInterval(this.timer);
    this.timer = null;
    this.timeTxt.destroy();
    // add loader as we are waiting for your free spin to come in
    // NOTE: we should poll NOW!
    this.addLoader(this.fullReelGrp, 315, 140);
  }

  addLoader(parent, x, y) {
    const lineWidth = 4;
    const r = 20;
    const d = r * 2 + lineWidth;
    const bmd = this.make.bitmapData(d, d);
    const { ctx } = bmd;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#ee3032';
    ctx.beginPath();
    ctx.arc(r + lineWidth / 2, r + lineWidth / 2, r, 0, Phaser.Math.degToRad(270));
    ctx.stroke();
    const img = this.add.image(x, y, bmd, null, parent);
    img.anchor.set(0.5);
    this.tweenMax().to(img, 1, { angle: 360, repeat: -1, ease: Linear.easeNone });
    return img;
  }

  unlockSlots() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.game.physics.p2.clear();
    this.lock.destroy();
    this.lock = null;
    this.lockGrp.destroy();
    this.lockGrp = null;
    this.addSlots();
  }

  lockSlots() {
    this.fullReelGrp.destroy();
    this.fullReelGrp = null;
    this.crank.destroy();
    this.crank = null;
    this.addSlots();
  }

  setTime(remaining) {
    const duration = moment.duration(remaining, 'seconds');
    this.timeTxt.text = duration.format('hh:mm:ss', { trim: false });
  }

  addCrankHighlight(parent, x, y) {
    const d = 70;
    const lineThickness = 10;
    const graphics = this.make.graphics(0, 0);
    graphics.lineStyle(lineThickness, 0xe51a27);
    graphics.drawEllipse(0, 0, d, d);

    const texture = graphics.generateTexture();
    //  Then generate a texture from it and apply the texture to the sprite
    const sprite = this.add.sprite(x, y, texture, null, parent);
    sprite.anchor.set(0.5);
    sprite.scale.set(0.7);
    this.tweenMax().to(sprite.scale, 1, { x: 1, y: 1, repeat: -1 });
    this.tweenMax().to(sprite, 1, { alpha: 0, repeat: -1 });
    return sprite;
  }

  addRedButtonHighlight(parent, x, y) {
    const w = 140;
    const h = 40;
    const lineThickness = 10;
    const graphics = this.make.graphics(0, 0);
    graphics.lineStyle(lineThickness, 0xffd900);
    graphics.drawEllipse(0, 0, w, h);

    const texture = graphics.generateTexture();
    //  Then generate a texture from it and apply the texture to the sprite
    const sprite = this.add.sprite(x, y, texture, null, parent);
    sprite.anchor.set(0.5);
    sprite.scale.set(0.7);
    this.tweenMax().to(sprite.scale, 1, { x: 1, y: 1, repeat: -1 });
    this.tweenMax().to(sprite, 1, { alpha: 0, repeat: -1 });
    return sprite;
  }

  addReelBg(parent, x, y) {
    const w = (TILE_WIDTH + SPACING) * 3;
    const h = 260;
    const bmd = this.make.bitmapData(w, h);
    this.addBmd(bmd);
    const ctx = bmd.ctx;
    const img = this.game.cache.getImage('bg_reel_tile');
    const pat = ctx.createPattern(img, 'repeat');
    ctx.rect(0, 0, w, h);
    ctx.fillStyle = pat;
    ctx.fill();
    const im = this.add.image(x, y, bmd, null, parent);
    console.log('made image', im.width);
    return im;
  }

  makeReelShadowBmd() {
    const w = (TILE_WIDTH + SPACING) * 3;
    const h = 48;
    const bmd = this.make.bitmapData(w, h);
    this.addBmd(bmd);
    const ctx = bmd.ctx;
    const img = this.game.cache.getImage('shadow');
    const pat = ctx.createPattern(img, 'repeat');
    ctx.rect(0, 0, w, h);
    ctx.fillStyle = pat;
    ctx.fill();
    return bmd;
  }

  addReelShadow(parent, x, y, bmd) {
    return this.add.image(x, y, bmd, null, parent);
  }

  handleReceivedResult(data) {
    console.log('handleReceivedResult', data);
    const winner = !!data;
    const middleLine = winner ? times(NUM_REELS).map(() => data.sport) : randomMiddleLine();
    if (!winner) {
      console.log('SORRY NOT A WINNER');
    } else {
      console.log('OMG WINNER!!!!!!!!!!', data.sport);
    }
    const result = times(NUM_REELS).map(i => [sample(SYMBOLS), middleLine[i], sample(SYMBOLS)]);
    if (this.spinTl.isActive()) {
      this.spinTl.call(this.stop, [result, winner], this);
    } else {
      this.stop(result, winner);
    }
  }

  spin() {
    this.game.props.onSpin();
    this.disableCrank();
    this.game.add.sound('click').play();
    this.spinSnd = this.game.add.sound('spin', 1, true);
    this.spinSnd.play();

    const tl = this.timelineMax();
    this.reels.forEach((reel, i) => tl.call(reel.spin, [], reel, i * SPIN_DELAY));
    tl.call(this.spinComplete, [], this, 2);
    this.spinTl = tl;
  }

  spinComplete() {}

  hasLongDelay(results) {
    return results[0][1] === results[1][1];
  }

  stop(results, winner) {
    const { spinsRemaining, freeTicketsRemaining } = this.game.props;
    const locked = spinsRemaining === 0 || freeTicketsRemaining === 0;
    console.log('stop', results);
    this.crank.animations.play('up');
    if (locked) this.disableCrank(true);
    const delays = [
      0,
      SPIN_DELAY * 2,
      this.hasLongDelay(results) ? generateAnticipationDelay() : SPIN_DELAY * 4,
    ];
    this.tweenMax().delayedCall(delays[2] - 0.5, () => {
      if (winner) {
        this.game.add.audio('super_success').play();
      } else {
        this.game.add.audio('reaction').play();
      }
    });
    const promises = this.reels.map(
      (reel, i) =>
        new Promise(resolve =>
          this.tweenMax().delayedCall(delays[i], () => {
            reel.requestStop(results[i], () => {
              const uniqLength = uniq(times(i + 1).map(j => results[j][1])).length;
              if (uniqLength === 1) {
                this.game.add.audio('select').play();
              } else {
                this.game.add.audio('stick').play();
              }
              resolve();
            });
          }),
        ),
    );
    Promise.all(promises).then(() => this.handleSpinsComplete(winner));
  }

  handleSpinsComplete(winner) {
    const { spinsRemaining } = this.game.props;
    console.log('handleSpinsComplete', spinsRemaining);
    this.spinSnd.stop();
    if (winner) {
      this.reels.forEach(reel => reel.glow());
      this.tweenMax().delayedCall(2, () => {
        this.handleSpinsReallyComplete(winner);
        this.game.props.onSpinComplete();
      });
    } else {
      this.handleSpinsReallyComplete(winner);
      this.game.props.onSpinComplete();
    }
  }

  handleSpinsReallyComplete(winner) {
    const { spinsRemaining } = this.game.props;
    if (!winner) {
      if (spinsRemaining === 0) {
        this.transitionToLockedScreen();
      } else {
        this.enableCrank();
      }
    }
  }

  /* -------------------------------------------------------
    -- PRIVATE
    ------------------------------------------------------- */

  addReel(key, parent, x, y) {
    const reel = new Reel(this.game, key, SYMBOLS);
    reel.position.set(x, y);
    parent.addChild(reel);
    return reel;
  }

  addBacking(parent, x, y) {
    const reel = this.add.image(x, y, 'reel', null, parent);
    return reel;
  }

  addCrank(parent, x, y) {
    const sprite = this.make.sprite(x, y, 'crank', 'up');
    parent.addChildAt(sprite, 0);
    sprite.animations.add('down', ['up', 'middle', 'down'], 30, false, false);
    sprite.animations.add('up', ['down', 'middle', 'up'], 30, false, false);
    sprite.inputEnabled = true;
    sprite.input.useHandCursor = true;
    sprite.events.onInputUp.add(() => {
      this.highlight.visible = false;
      sprite.animations.play('down').onComplete.addOnce(this.spin, this);
    });
    return sprite;
  }

  addRedButton(parent, x, y) {
    const sprite = this.add.sprite(x, y, 'red_button', 'button_up', parent);
    sprite.animations.add('down', [1, 0]);
    sprite.animations.add('up', [0, 1]);
    sprite.anchor.set(0.5, 0);
    sprite.inputEnabled = true;
    sprite.input.useHandCursor = true;
    sprite.events.onInputUp.add(() => {
      this.highlight.visible = false;
      sprite.animations.play('down');
      this.spin();
    });
    return sprite;
  }

  addBackCoins() {
    const { isDesktop } = this.game.props;
    const x = isDesktop ? 40 : 0;
    const y = isDesktop ? 300 : 200;
    this.add.image(x, y, 'coins', 'back_coins');
  }

  addFrontCoins() {
    const { isDesktop } = this.game.props;
    const x = isDesktop ? 10 : 10;
    const y = isDesktop ? 370 : 300;
    this.add.image(x, y, 'coins', 'front_coins');
  }

  addBmd(bmd) {
    this.bmds.push(bmd);
  }
}

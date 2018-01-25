import times from 'lodash/times';
import shuffle from 'lodash/shuffle';
import sample from 'lodash/sample';
import { TILE_WIDTH, TILE_HEIGHT, SPACING } from '../constants';
import '../filters/BlurY';
import '../filters/Gray';

const { Back, Linear } = window;

export default class Reel extends Phaser.Group {
  constructor(game, symbols) {
    super(game, null, 'reel');

    this.symbols = symbols;
    this.makeLine();
    this.maxHeight = this.height / 2;
    this.blurY = game.add.filter('BlurY');
    this.grayFilter = game.add.filter('Gray');
    this.stopping = false;
    this.overlay = this.addOverlay(this, 0, -this.maxHeight + TILE_WIDTH);
    this.blurY.blur = 0;
    this.filters = [this.blurY];
  }

  destroy() {
    this.blurY = null;
    this.grayFilter = null;
    super.destroy();
  }

  spin() {
    this.results = null;
    TweenMax.killTweensOf(this.overlay);
    this.overlay.alpha = 1;
    this.overlay.visible = false;
    this.part[1].cards.forEach((card) => {
      card.filters = null;
    });
    TweenMax.killTweensOf(this);
    this.y = 0;
    const DURATION = 0.22;
    this.spinner = TweenMax.to(this, DURATION, {
      onRepeat: this.handleRepeat,
      onRepeatScope: this,
      y: this.maxHeight,
      repeat: -1,
      ease: Linear.easeNone,
    });

    this.blurY.blur = 100;
    this.filters = [this.blurY];
  }

  requestStop(results, onComplete) {
    this.stopping = true;
    this.results = results;
    this.onComplete = onComplete;
  }

  setLine(results, part = 1) {
    this.part[part].cards.map((card, i) => card.setSymbol(results[i]));
  }

  getCard(i) {
    return this.part[1].cards[i];
  }

  /* -------------------------------------------------------
    -- PRIVATE
    ------------------------------------------------------- */

  stop(results) {
    // console.log('stop', results);
    // oddly, you actually have to pause before you kill
    // to ensure there's not another tick after this.
    this.spinner.pause().kill();

    this.setLine(this.part[1].cards.map(card => card.name), 0);
    this.setLine(results);

    const tl = new TimelineMax({
      onComplete: () => {
        this.filters = null;
        this.onComplete();
      },
    });
    tl
      .to(this, 0.8, { y: this.maxHeight, ease: Back.easeOut.config(1) })
      .to(this.blurY, 0.8, { blur: 0, ease: Back.easeOut.config(1) }, 0);
  }

  glow(delay) {
    this.part[1].cards.forEach((card, i) => {
      if (this.results[i] === 'playchip') {
        this.overlay.y = -this.maxHeight + TILE_WIDTH * i;
        this.overlay.visible = true;
        TweenMax.to(this.overlay, 1, { alpha: 0, repeat: -1, yoyo: true, delay });
      } else {
        this.part[1].cards[i].filters = [this.grayFilter];
      }
    });
  }

  greyOutNonPlayChips() {
    this.part[1].cards.forEach((card, i) => {
      if (this.results[i] !== 'playchip') {
        this.part[1].cards[i].filters = [this.grayFilter];
      }
    });
  }

  handleRepeat() {
    if (this.stopping) {
      this.stop(this.results);
      this.stopping = false;
    } else {
      this.setLine(this.part[1].cards.map(card => card.name), 0);
      this.setLine(times(3, () => sample(this.symbols)), 1);
    }
  }

  addOverlay(parent, x, y) {
    const grp = this.game.add.group(parent);
    grp.position.set(x, y);
    grp.visible = false;

    // overlay
    const g = this.game.add.graphics(0, 0, grp);
    g.beginFill(0xfed700, 0.8).drawRect(0, 0, TILE_WIDTH, TILE_HEIGHT);
    g.blendMode = PIXI.blendModes.ADD;

    // outline
    const ol = this.game.add.graphics(0, 0, grp);
    ol.lineStyle(10, 0xf4c60b).drawRect(0, 0, TILE_WIDTH, TILE_HEIGHT);

    return grp;
  }

  makeLine() {
    const line = this.makeSingleLine();
    const line2 = this.makeSingleLine();
    line2.y = -line.height;
    this.addChild(line);
    this.addChild(line2);
    this.part = [line, line2];
    this.part.map((part, i) => this.setLine(times(3, () => sample(this.symbols)), i));
    // this.part.map((part, i) => this.setLine(this.symbols.slice(0, 3), i));
  }

  makeSingleLine() {
    const numCards = 3;
    const grp = this.game.make.group(null, 'line');
    let y = 0;
    grp.cards = times(numCards).map(() => {
      const card = this.makeCard(grp);
      card.y = y;
      y += card.height;
      return card;
    });
    return grp;
  }

  makeCard(parent) {
    const grp = this.game.add.group(parent);
    const sprite = this.game.add.sprite(0, 0, 'symbols', null, grp);
    const anim = sprite.animations.add(
      'playchip-start',
      Phaser.Animation.generateFrameNames('playchip', 1, 4, '', 4),
      30,
    );
    const loopAnim = sprite.animations.add(
      'playchip-loop',
      Phaser.Animation.generateFrameNames('playchip', 4, 74, '', 4),
      30,
      true,
    );
    anim.onComplete.addOnce(() => {
      loopAnim.play();
    }, this);
    sprite.width = TILE_WIDTH;
    sprite.height = TILE_HEIGHT;
    grp.setSymbol = (symbolName) => {
      grp.name = symbolName;
      if (symbolName === 'playchip') {
        // symbol.animations.stop('symbols', true);
        sprite.frameName = 'playchip0000';
      } else {
        sprite.animations.stop();
        sprite.frameName = symbolName;
      }
    };
    grp.playCurrentAnimation = () => {
      if (!sprite.animations.currentAnim.isPlaying) {
        sprite.animations.currentAnim.play();
      }
    };
    grp.stopAnimation = () => {
      if (sprite.animations.currentAnim.isPlaying) {
        sprite.animations.currentAnim.stop();
      }
    };

    return grp;
  }
}

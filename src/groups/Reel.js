// import { times, shuffle } from 'lodash';
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

    this.timelineMax = this.game.state.getCurrentState().timelineMax;
    this.tweenMax = this.game.state.getCurrentState().tweenMax;

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
    this.timelineMax = null;
    this.tweenMax = null;
    this.blurY = null;
    this.grayFilter = null;
    super.destroy();
  }

  spin() {
    this.tweenMax().killTweensOf(this.overlay);
    this.overlay.alpha = 1;
    this.overlay.visible = false;
    this.part[1].cards.forEach((card) => {
      card.filters = null;
    });
    this.tweenMax().killTweensOf(this);
    this.y = 0;
    const DURATION = 0.22;
    this.spinner = this.tweenMax().to(this, DURATION, {
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
    console.log('setLine', results);
    this.part[part].cards.map((card, i) => card.setSymbol(results[i]));
  }

  /* -------------------------------------------------------
    -- PRIVATE
    ------------------------------------------------------- */

  stop(results) {
    // oddly, you actually have to pause before you kill
    // to ensure there's not another tick after this.
    this.spinner.pause().kill();

    this.setLine(results);

    const tl = this.timelineMax({
      onComplete: () => {
        this.filters = null;

        // this.part[1].cards[0].filters = [this.grayFilter];
        // this.part[1].cards[2].filters = [this.grayFilter];

        // this.overlay.visible = true;
        // TweenMax.to(this.overlay, 1, { alpha: 0, repeat: -1, yoyo: true });

        this.onComplete();
      },
    });
    tl
      .to(this, 0.8, { y: this.maxHeight, ease: Back.easeOut.config(1) })
      .to(this.blurY, 0.8, { blur: 0, ease: Back.easeOut.config(1) }, 0);
  }

  glow() {
    this.overlay.visible = true;
    this.tweenMax().to(this.overlay, 1, { alpha: 0, repeat: -1, yoyo: true });
  }

  handleRepeat() {
    if (this.stopping) {
      this.stop(this.results);
      this.results = null;
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
    // const width = TILE_WIDTH;
    // const height = TILE_HEIGHT;

    // temp is to make sure blur filter works...bug
    // const temp = this.game.add.image(0, 0, 'star_particle', null, grp);
    // temp.alpha = 0.1;
    const symbol = this.game.add.sprite(0, 0, 'symbols', null, grp);
    const anim = symbol.animations.add(
      'symbols',
      Phaser.Animation.generateFrameNames('symbols', 1, 64, '', 4),
      30,
      true,
    );
    symbol.width = TILE_WIDTH;
    symbol.height = TILE_HEIGHT;
    grp.setSymbol = (symbolName) => {
      console.log('setSymbol', symbolName);
      grp.name = symbolName;
      if (symbolName === 'symbols') {
        symbol.animations.play('symbols');
      } else {
        symbol.frameName = symbolName;
      }
    };

    return grp;
  }
}

import times from 'lodash/times';
import shuffle from 'lodash/shuffle';
import { transformise, dollarize } from '../utils';
import { TILE_WIDTH, TILE_HEIGHT, SPACING } from '../constants';
import '../filters/BlurY';
import '../filters/Gray';

const {
  TweenMax,
  TimelineMax,
  Back,
  Linear,
  Phaser,
  PIXI,
} = window;

export default class Reel extends Phaser.Group {

  constructor(game, name, players) {
    super(game, null, 'reel');

    this.name = name;
    this.players = players;
    this.makeLine();
    this.maxHeight = this.height / 2;
    this.blurY = game.add.filter('BlurY');
    this.grayFilter = game.add.filter('Gray');
    this.stopping = false;
    this.overlay = this.addOverlay(this, 0, -this.maxHeight + TILE_WIDTH + SPACING);
  }

  spin() {
    console.log('spin', this.name);
    TweenMax.killTweensOf(this.overlay);
    this.overlay.alpha = 1;
    this.overlay.visible = false;
    this.part[1].cards.forEach((card) => {
      card.filters = null;
    });
    TweenMax.killTweensOf(this);
    this.y = 0;
    this.spinner = TweenMax.to(this, 0.22, {
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
    this.part[part].cards.map((card, i) => (
      card.setPlayer(results[i])
    ));
  }


  /* -------------------------------------------------------
    -- PRIVATE
    ------------------------------------------------------- */

  stop(results) {
    // oddly, you actually have to pause before you kill
    // to ensure there's not another tick after this.
    this.spinner.pause().kill();

    this.setLine(results);

    const tl = new TimelineMax({
      onComplete: () => {
        this.filters = null;
        this.game.add.audio('select').play();
        this.part[1].cards[0].filters = [this.grayFilter];
        this.part[1].cards[2].filters = [this.grayFilter];

        this.overlay.visible = true;
        TweenMax.to(this.overlay, 1, { alpha: 0, repeat: -1, yoyo: true });
        this.onComplete();
      },
    });
    tl.to(this, 0.8, { y: this.maxHeight, ease: Back.easeOut.config(1) })
      .to(this.blurY, 0.8, { blur: 0, ease: Back.easeOut.config(1) }, 0);
  }

  handleRepeat() {
    if (this.stopping) {
      this.stop(this.results);
      this.results = null;
      this.stopping = false;
    } else {
      this.setLine(this.part[1].cards.map(card => card.player), 0);
      this.setLine(shuffle(this.players).slice(0, 3), 1);
    }
  }

  addOverlay(parent, x, y) {
    const grp = this.game.add.group(parent);
    grp.position.set(x, y);
    grp.visible = false;

    // outline
    const ol = this.game.add.graphics(0, 0, grp);
    ol.lineStyle(10, 0xffffff)
      .drawRect(0, 0, TILE_WIDTH, TILE_HEIGHT);

    // overlay
    const g = this.game.add.graphics(0, 0, grp);
    g.beginFill(0xfed700, 0.8)
     .drawRect(0, 0, TILE_WIDTH, TILE_HEIGHT);
    g.blendMode = PIXI.blendModes.ADD;

    return grp;
  }

  makeLine() {
    const line = this.makeSingleLine();
    const line2 = this.makeSingleLine();
    line2.y = -line.height;
    this.addChild(line);
    this.addChild(line2);
    this.part = [line, line2];
    this.part.map((part, i) => this.setLine(shuffle(this.players).slice(0, 3), i));
  }

  makeSingleLine() {
    const numCards = 3;
    const grp = this.game.make.group(null, 'line');
    let y = 0;
    grp.cards = times(numCards).map(() => {
      const card = this.makeCard(grp);
      card.y = y;
      y += card.height + SPACING;
      return card;
    });
    return grp;
  }

  makeCard(parent) {
    const grp = this.game.add.group(parent);

    const burst = this.game.add.sprite(0, 0, 'assets', null, grp);
    burst.name = 'burst';
    const width = TILE_WIDTH;
    const height = TILE_HEIGHT;
    const player = this.game.add.sprite(0, 0, 'players', null, grp);
    player.name = 'player';
    const textBack = this.game.add.image(0, height, 'assets', 'card_bottom', grp);
    textBack.anchor.set(0, 1);
    textBack.height = 57;
    const style = { size: 16, font: 'phosphate' };
    const firstNameTxt = this.game.add.bitmapText(
      width / 2,
      height - 36,
      style.font,
      '',
      style.size,
      grp
    );
    firstNameTxt.anchor.set(0.5, 1);
    firstNameTxt.name = 'firstNameText';

    const lastNameTxt = this.game.add.bitmapText(
      width / 2,
      height - 20,
      style.font,
      '',
      style.size,
      grp
    );
    lastNameTxt.anchor.set(0.5, 1);
    lastNameTxt.name = 'lastNameText';

    const salaryTxt = this.game.add.bitmapText(
      width / 2,
      height - 3,
      'pantoon_yellow',
      '',
      16,
      grp
    );
    salaryTxt.anchor.set(0.5, 1);
    salaryTxt.name = 'salaryText';

    grp.setPlayer = (p) => {
      grp.player = p;
      grp.getByName('burst').frameName = `burst_${p.id % 3 + 1}`;
      grp.getByName('player').frameName = transformise(p.fullName);
      const firstName = grp.getByName('firstNameText');
      firstName.text = p.firstName.toUpperCase();
      const lastName = grp.getByName('lastNameText');
      lastName.text = p.lastName.toUpperCase();
      const salary = grp.getByName('salaryText');
      salary.text = dollarize(p.salary);
    };

    return grp;
  }
}

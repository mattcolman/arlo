import Phaser from 'phaser';
import times from 'lodash/times';
import flatten from 'lodash/flatten';
import lightCoords from '../lightCoords';
import lightCoords2 from '../lightCoords2';
import lightCoords2mobile from '../lightCoords2mobile';
import * as Animation from '../Animation';
import State from '../State';

// [MC] gsap is weird with npm. Seems to be problem with multiple gsap deps.
const { Back } = window;

export default class extends State {

  create() {
    super.create();

    console.log('create victory!!!!!!!!!')

    // this.addBackground();
    this.addVictoryTitle();
    this.addCoins();
    this.addBody();

    this.timelineMax({ delay: 0.1 })
      .call(() => {
        this.game.add.audio('success').play();
      })
      .from(this.victoryCnt.scale, 0.5, { x: 0, y: 0, ease: Back.easeOut })
      .from(this.bodyCnt.scale, 0.5, { x: 0, y: 0, ease: Back.easeOut }, 0.2)
      .from(this.coins, 0.5, { alpha: 0 }, 0.4);
  }

  shutdown() {
    console.log('shutdown victory!!!!!!!')
    this.killAllTweens();
  }

  addCoins() {
    const { isDesktop } = this.game.props;
    this.coins = this.add.image(0, this.world.height, isDesktop ? 'victory_coins' : 'victory_coins_mobile', null, this.world);
    this.coins.anchor.y = 1;
  }

  addBody() {
    const { isDesktop } = this.game.props;
    this.bodyCnt = this.add.group();
    const back = this.add.image(0, 0, isDesktop ? 'victory_back' : 'victory_back_mobile', null, this.bodyCnt);
    const halfX = Math.round(back.width / 2);
    const halfY = Math.round(back.height / 2);
    this.bodyCnt.pivot.set(halfX, halfY);
    this.bodyCnt.position.set(this.world.centerX, halfY + 200);

    const lights = this.addLights(this.bodyCnt, isDesktop ? lightCoords2 : lightCoords2mobile, 'light');
    this.animateLights2(lights);

    this.iconCnt = this.add.group(this.bodyCnt);
    this.iconCnt.position.set(halfX, isDesktop ? 96 : 120);
    // 3 x competition icons
    times(3).forEach((i) => {
      const img = this.add.image(i * (isDesktop ? 48 : 80), 0, 'nba', null, this.iconCnt);
      img.width = isDesktop ? 40 : 70;
      img.scale.y = img.scale.x;
    });
    this.iconCnt.pivot.x = this.iconCnt.width / 2;

    const txtGrp = this.add.group(this.bodyCnt);
    const title1 = 'You\'ve won a free ticket!';
    const txt1 = this.add.text(0, 0, title1.toUpperCase(), {
      font: '30px Avenir', fill: '#12232b', fontWeight: 600, wordWrap: true, wordWrapWidth: back.width - 250, align: 'center',
    }, txtGrp);
    txt1.anchor.set(0.5, 0);

    const title2 = 'NBA challenge fj lkfjlkfj lkfj lkfj flkj flkjf lkfjlk';
    const txt2 = this.add.text(0, txt1.height + 8, title2.toUpperCase(), {
      font: '36px Avenir', fill: '#12232b', fontWeight: 400, wordWrap: true, wordWrapWidth: back.width - 250, align: 'center',
    }, txtGrp);
    txt2.anchor.set(0.5, 0);
    txtGrp.position.set(halfX, halfY - txtGrp.height / 2);

    const prizeGrp = this.add.group(this.bodyCnt);
    const trophy = this.add.image(0, 0, 'trophy', null, prizeGrp);
    const prizePool = this.add.text(50, -5, '$250.00', { font: '40px Avenir', fontWeight: 600, fill: '#12232b' }, prizeGrp);
    prizeGrp.pivot.x = Math.round(prizeGrp.width / 2);
    prizeGrp.position.set(halfX, back.height - 150);

    const playBtn = this.add.button(halfX, back.height - 30, 'play_btn', () => {
      console.log('click');
    }, this, 'over', 'up', 'down', 'up', this.bodyCnt);
    playBtn.anchor.set(0.5);
  }

  addVictoryTitle() {
    this.victoryCnt = this.add.group();

    this.addVictoryText(this.victoryCnt);
    const lights = this.addLights(this.victoryCnt, lightCoords, 'light', 0.6);

    this.victoryCnt.pivot.set(this.victoryCnt.width / 2, this.victoryCnt.height / 2);
    this.victoryCnt.position.set(this.world.width / 2, this.victoryCnt.height / 2);

    this.tweenMax().delayedCall(1, () => {
      this.animateLights(lights);
    });
  }

  addBackground() {
    const rect = this.add.graphics(0, 0);
    rect.beginFill(0xff0000, 0.2);
    rect.drawRect(0, 0, this.world.width, this.world.height);
  }

  addVictoryText(parent) {
    this.add.image(0, 0, 'victory', null, parent);
  }

  addLights(parent, coords, lightName, scale) {
    return coords.map(letter => (
      letter.map(pt => (
        this.addLight(parent, lightName, pt.x, pt.y, scale)
      ))
    ));
  }

  addLight(parent, name, x, y, scale = 1) {
    const back = this.add.sprite(x, y, name, 'off', parent);
    back.anchor.set(0.5);
    back.scale.set(scale);
    const front = this.add.sprite(x, y, name, 'on', parent);
    front.anchor.set(0.5);
    front.scale.set(scale);
    return front;
  }

  animateLights(lights) {
    const tl = this.timelineMax({ repeat: -1 });
    tl
      .add(Animation.letterReveal(lights))
      .add(Animation.letterFlash(lights, 1))
      .add(Animation.sparkle(lights, 1))
      .add(Animation.letterCycle(lights, 1))
      .add(Animation.letterFlash(lights, 1))
      .add(Animation.cycle(lights));
  }

  animateLights2(lights) {
    const tl = this.timelineMax({ repeat: -1 });
    tl
      .add(Animation.alternateLights(lights))
  }
}

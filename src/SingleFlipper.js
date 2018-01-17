import { Group } from 'phaser';

const { Quad } = window;

const WIDTH = 40;
const HEIGHT = 60;

export default class SingleFlipper extends Group {
  constructor(game) {
    super(game, null, 'single-flipper');
    this.timelineMax = this.game.state.getCurrentState().timelineMax;
    this.number = 0;

    this.bgTexture = this.makeBgTexture();
    this.bottomFlipper = this.addSpinner(this, 0, 0);
    this.topFlipper = this.addSpinner(this, 0, 0);
  }

  destroy() {
    if (this.bmd) this.bmd.destroy();
    this.bmd = null;
    super.destroy();
  }

  setNumber(number) {
    this.number = number;
    this.bottomFlipper.setNumber(number);
    this.topFlipper.setNumber(number);
  }

  handleFlipUpdate() {
    this.topFlipper.updateTextures();
    this.bottomFlipper.updateTextures();
  }

  flipToNumber(num) {
    if (this.number === num) return false;
    // console.log('flip from', this.number, 'to', num);
    const flipForward = num < this.number;
    this.number = num;
    this.bottomFlipper.setNumber(num);
    const tl = this.timelineMax({ onUpdate: this.handleFlipUpdate, onUpdateScope: this });

    let animateOut;
    let animateIn;
    if (flipForward) {
      animateOut = this.timelineMax()
        .add(this.topFlipper.flipBottomOut())
        .set(this.bottomFlipper.shadow, { alpha: 1 }, 0);

      animateIn = this.timelineMax()
        .add(this.bottomFlipper.flipTopIn())
        .to(this.bottomFlipper.shadow, 1, { alpha: 0 }, 0);
    } else {
      animateOut = this.timelineMax()
        .add(this.topFlipper.flipTopOut())
        .set(this.bottomFlipper.shadow, { alpha: 0 }, 0)
        .to(this.topFlipper.shadow, 1, { alpha: 1 }, 0);

      animateIn = this.timelineMax().add(this.bottomFlipper.flipBottomIn());
    }

    return tl
      .add(animateOut)
      .call(() => {
        this.addChild(this.bottomFlipper);
        const temp = this.bottomFlipper;
        this.bottomFlipper = this.topFlipper;
        this.topFlipper = temp;
      })
      .add(animateIn)
      .duration(0.5);
  }

  addSpinner(parent, x, y) {
    const textureGroup = this.makeTextureGroup();
    const topT = this.game.add.renderTexture(WIDTH, HEIGHT / 2);
    topT.updateTexture = () => {
      topT.clear();
      topT.renderXY(textureGroup, 0, 0);
    };
    const bottomT = this.game.add.renderTexture(WIDTH, HEIGHT / 2);
    bottomT.updateTexture = () => {
      bottomT.clear();
      bottomT.renderXY(textureGroup, 0, -HEIGHT / 2);
    };
    const grp = this.game.add.group(parent);
    grp.position.set(x, y);

    const topHalf = this.game.add.image(0, 0, topT, null, grp);
    topHalf.anchor.y = 1;
    topHalf.y = HEIGHT / 2;

    const bottomHalf = this.game.add.image(0, (HEIGHT / 2) + 1, bottomT, null, grp);

    // NOTE the shadow is shared between both halves.
    grp.shadow = textureGroup.shadow;
    grp.bottomHalf = bottomHalf;
    grp.topHalf = topHalf;

    grp.updateTextures = () => {
      bottomT.updateTexture();
      topT.updateTexture();
    };

    grp.setNumber = num => {
      textureGroup.txt.text = num;
      topT.updateTexture();
      bottomT.updateTexture();
    };
    grp.flipTopIn = () => {
      return this.timelineMax()
        .set(topHalf.scale, { y: 0 })
        .to(topHalf.scale, 1, { y: 1, ease: Quad.easeOut });
    };
    grp.flipTopOut = () => {
      return this.timelineMax()
        .to(topHalf.scale, 1, { y: 0, ease: Quad.easeIn })
        .set(topHalf.scale, { y: 1 });
    };
    grp.flipBottomIn = () => {
      return this.timelineMax()
        .set(bottomHalf.scale, { y: 0 })
        .to(bottomHalf.scale, 1, { y: 1, ease: Quad.easeOut });
    };
    grp.flipBottomOut = () => {
      return this.timelineMax()
        .to(bottomHalf.scale, 1, { y: 0, ease: Quad.easeIn })
        .set(bottomHalf.scale, { y: 1 });
    };
    return grp;
  }

  makeTextureGroup() {
    const grp = this.game.make.group(null);
    this.game.add.image(0, 0, this.bgTexture, null, grp);
    const style = { size: 50, font: 'avenir_white' };
    const txt = this.game.add.bitmapText((WIDTH / 2) - 1, HEIGHT / 2, style.font, 0, style.size, grp);
    txt.anchor.set(0.5);
    grp.txt = txt;
    grp.shadow = this.addShadow(grp, 0, 0);
    grp.shadow.alpha = 0;
    return grp;
  }

  addShadow(parent, x, y) {
    this.bmd = this.makeShadowTexture();
    return this.game.add.image(x, y, this.bmd, null, parent);
  }

  makeShadowTexture() {
    const bmd = this.game.make.bitmapData(WIDTH, HEIGHT);
    const { ctx } = bmd;
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.5, 'rgba(0, 0, 0, 1)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    return bmd;
  }

  // TODO - add this to the cache.
  makeBgTexture() {
    const g = this.game.make.graphics(0, 0, this.grp);
    g.beginFill(0x353635).drawRoundedRect(0, 0, WIDTH, HEIGHT, 8);
    return g.generateTexture();
  }
}

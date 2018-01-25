import sample from 'lodash/sample';

const MESSAGE_POOL = [
  'spin and win!',
  'PlayChip Pre ICO Starting Soon!',
  'over $3 MILLION PlayChips purchased!',
  'win up to 230% bonus playchips!',
];

class MessageBoard extends Phaser.Plugin {
  currentAnimation = null;
  queue = [];
  textureBounds = {
    width: 250,
    height: 50,
  };
  style = 'scroll';
  init(parent) {
    this.parent = parent;
    this.txt = this.game.make.bitmapText(0, 0, 'panton_green', '', 32, parent);
    this.renderTexture = this.game.add.renderTexture(
      this.textureBounds.width,
      this.textureBounds.height,
    );
    this.tx = this.textureBounds.width;
    this.frame = 0;
    this.setRandomMessage();
  }

  destroy() {
    if (this.currentAnimation) this.currentAnimation.kill();
    this.queue = [];
  }

  addSprite() {
    return this.game.add.sprite(0, 0, this.renderTexture, null, this.parent);
  }

  handleMessageComplete() {
    this.queue.shift(); // remove first element
    if (this.queue.length === 0) {
      this.setRandomMessage();
    }
    this.animate();
  }

  handleUpdate = () => {
    this.renderTexture.clear();
    this.renderTexture.renderXY(this.txt, this.txt.x, 2);
  };

  animate() {
    if (this.currentAnimation) this.currentAnimation.kill();
    this.txt.text = this.queue[0];
    this.txt.x = this.textureBounds.width;
    this.currentAnimation = this.makeAnimation(this.style);
  }

  makeAnimation(style) {
    const animations = {
      scroll: this.scroll,
      pulse: this.pulse,
    };
    return animations[style].apply(this);
  }

  scroll() {
    return TweenMax.to(this.txt, 0.05, {
      x: '-=3',
      onComplete: this.handleScrollComplete,
    });
  }

  handleScrollComplete = () => {
    this.handleUpdate();
    if (this.txt.x < -this.txt.width) {
      this.handleMessageComplete();
    } else {
      this.currentAnimation = this.scroll();
    }
  };

  pulse() {
    this.txt.x = (this.textureBounds.width - this.txt.width) / 2;
    return new TimelineMax({
      repeat: 4,
      onComplete: this.handleMessageComplete,
      onCompleteScope: this,
    })
      .call(this.handleUpdate)
      .set(this.txt, { alpha: 0 }, 0.6)
      .call(this.handleUpdate)
      .set(this.txt, { alpha: 1 }, 1);
  }

  setRandomMessage() {
    this.style = 'scroll';
    this.queue = [sample(MESSAGE_POOL).toUpperCase()];
    this.animate();
  }

  setMessage(message, style = 'scroll') {
    this.style = style;
    this.queue = [message.toUpperCase()];
    this.animate();
  }

  queueMessage(message) {
    this.queue.push(message.toUpperCase());
  }
}

export default MessageBoard;

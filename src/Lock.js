import Phaser, { Plugin } from 'phaser';
import Chain from './Chain';
import Debug from './Debug';

class Lock extends Plugin {
  init(userProps = {}) {
    const defaultProps = {
      parent: this.world,
    };

    this.debug = true;

    this.props = {
      ...defaultProps,
      ...userProps,
    };

    this.addLock(this.props);
  }

  destroy() {
    window.removeEventListener('devicemotion', this.handleDeviceMotion);
    window.removeEventListener('mousemove', this.handleMouseMove);
    super.destroy();
  }

  async addLock() {
    await this.game.manifestLoader.loadManifest({ spritesheets: ['chain'], images: ['lock'] });
    const numLinks = 11;

    this.padLock = this.addPadLock(315, 275);

    this.chain1 = this.addRope({
      parent: this.props.parent,
      anchorA: { x: 56, y: 23 },
      anchorB: { x: 290, y: 250 },
      numLinks,
    });

    this.chain2 = this.addRope({
      parent: this.props.parent,
      anchorA: { x: 580, y: 23 },
      anchorB: { x: 340, y: 250 },
      numLinks,
      flipped: true,
    });

    if (this.game.device.touch) {
      window.addEventListener('devicemotion', this.handleDeviceMotion);
    } else {
      window.addEventListener('mousemove', this.handleMouseMove);
    }
  }

  handleDeviceMotion = (e) => {
    const ax = e.acceleration.x;
    const ay = e.acceleration.y;

    if (Debug.config.text) {
      this.game.state.getCurrentState().debugTxt.text = `ax: ${Math.round(ax)}, ay: ${Math.round(ay)}`;
    }

    const factorA = 20;
    const factorB = 10;
    const threshold = 1;
    if (ax > threshold || ax < -threshold || ay > threshold || ay < -threshold) {
      this.padLock.body.velocity.x += ax * factorA;
      this.padLock.body.velocity.y += ay * factorA;
      this.chain1.getLinks().forEach((link) => {
        link.body.velocity.x += ax * factorB;
        link.body.velocity.y += ay * factorB;
      });
      this.chain2.getLinks().forEach((link) => {
        link.body.velocity.x += ax * factorB;
        link.body.velocity.y += ay * factorB;
      });
    }
  }

  handleMouseMove = (e) => {
    if (this.targetX === undefined) this.targetX = 0;
    if (this.prevX === undefined) this.prevX = e.clientX;
    this.diffX = this.prevX - e.clientX;
    this.prevX = e.clientX;
    this.targetX += this.diffX;
    this.padLock.body.velocity.x += this.diffX;
    this.chain1.getLinks().forEach((link) => { link.body.velocity.x += this.diffX });
    this.chain2.getLinks().forEach((link) => { link.body.velocity.x += this.diffX });
    // console.log('mouse moveee', this.diffX);
  }

  // ********* PRIVATE ********** \\

  addPadLock(x, y) {
    const pivot = this.game.add.sprite(x, y - 10, 'lock', null, this.props.parent);
    this.game.physics.p2.enable(pivot, false);
    pivot.body.static = true;
    pivot.body.clearCollision(true, true);
    pivot.visible = false;

    const lock = this.game.add.sprite(x, y, 'lock', null, this.props.parent);
    this.game.physics.p2.enable(lock, false);
    lock.body.mass = 1;
    // lock.body.velocity.x = 400;
    lock.body.clearCollision(true, true);
    lock.body.angularDamping = 0.95;

    // use a revoluteContraint to attach mouseBody to the clicked body
    const constraint = this.game.physics.p2.createRevoluteConstraint(
      pivot,
      [0, 0],
      lock,
      [0, -20],
      10000,
    );
    constraint.lowerLimit = Phaser.Math.degToRad(-70);
    constraint.upperLimit = Phaser.Math.degToRad(70);
    constraint.lowerLimitEnabled = true;
    constraint.upperLimitEnabled = true;
    return lock;
  }

  addRope(props) {
    return this.game.plugins.add(Chain, props);
  }
}

export default Lock;

import Phaser, { Plugin } from 'phaser';
import times from 'lodash/times';

class Chain extends Plugin {
  init(userProps = {}) {
    const defaultProps = {
      parent: this.world,
      numLinks: 10,
      anchorA: { x: 0, y: 0 },
      anchorB: { x: 0, y: 300 },
      key: 'chain',
      flipped: false,
    };

    this.props = {
      ...defaultProps,
      ...userProps,
    };

    this.createRope(this.props);
  }

  destroy() {
    super.destroy();
  }

  getLinks() {
    return this.allRects;
  }

  createRope(props) {
    const height = 35;
    const width = 35;
    const maxForce = 20000;
    let lastRect;
    let newRect;
    this.allRects = [];

    const {
      anchorA,
      anchorB,
      numLinks,
      parent,
      key,
      flipped,
    } = props;

    times(numLinks).forEach((i) => {
      const x = anchorA.x + (((anchorB.x - anchorA.x) / (numLinks - 1)) * i);
      const y = anchorA.y + (((anchorB.y - anchorA.y) / (numLinks - 1)) * i);

      if (i % 2 === 0) {
        newRect = this.game.add.sprite(x, y, key, 1, parent);
      } else {
        newRect = this.game.add.sprite(x, y, key, 0, parent);
        lastRect.bringToTop();
      }

      this.game.physics.p2.enable(newRect, false);

      newRect.body.setRectangle(width, height);

      if (i === 0) {
        newRect.body.static = true;
      } else if (i === numLinks - 1) {
        newRect.body.static = true;
        const angle = -Phaser.Math.radToDeg(Phaser.Math.angleBetweenPoints(anchorA, anchorB));
        newRect.body.angle = flipped ? 180 + angle : angle;
      } else {
        newRect.body.mass = (numLinks - 1) / i; //  Reduce mass for evey rope element
        this.allRects.push(newRect);
      }

      //  After the first rectangle is created we can add the constraint
      if (lastRect) {
        this.game.physics.p2.createRevoluteConstraint(
          newRect,
          [0, -height / 2],
          lastRect,
          [0, height / 2],
          maxForce,
        );
      }

      lastRect = newRect;
    });
  }
}

export default Chain;

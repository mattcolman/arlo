import times from 'lodash/times';
import padStart from 'lodash/padStart';
import { Plugin } from 'phaser';
import SingleFlipper from './SingleFlipper';

export default class FlipCounter extends Plugin {
  init(userProps = {}) {
    const defaultProps = {
      numDigits: 3,
      startNumber: 0,
      parent: this.world,
    };

    this.timelineMax = this.game.state.getCurrentState().timelineMax;
    this.bmds = [];
    this.props = {
      ...defaultProps,
      ...userProps,
    };

    const {
      numDigits,
      startNumber,
      parent,
    } = this.props;

    this.grp = this.game.add.group(parent);

    this.flippers = times(numDigits).map(i => this.addFlipper(this.grp, i * 41, 0));

    this.setNumber(startNumber);
  }

  destroy() {
    this.timelineMax = null;
    while (this.flippers.length === 0) {
      this.flippers.pop().destroy();
    }
    super.destroy();
  }

  getDisplayGroup() {
    return this.grp;
  }

  addFlipper(parent, x, y) {
    const flipper = new SingleFlipper(this.game);
    flipper.position.set(x, y);
    parent.addChild(flipper);
    return flipper;
  }

  setNumber(number) {
    this.number = parseInt(number, 10);
    const numString = padStart(number, this.props.numDigits, 0);
    `${numString}`.split('').forEach((num, i) => {
      this.flippers[i].setNumber(parseInt(num, 10));
    });
  }

  flipToNumber(number) {
    this.number = number;
    const numString = padStart(number, this.props.numDigits, 0);
    `${numString}`.split('').forEach((num, i) => {
      this.flippers[i].flipToNumber(parseInt(num, 10));
    });
  }
}

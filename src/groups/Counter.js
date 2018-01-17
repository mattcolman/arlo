import times from 'lodash/times';
import padStart from 'lodash/padStart';

export default class Counter extends Phaser.Group {
  constructor(game, initNumber, props) {
    super(game, null, 'counter');
    const {
      style = { size: 28, font: 'Arial' },
      spacing = 20,
      numDigits = 2,
    } = props;
    this.props = props;
    this.digits = times(numDigits).map((i) => {
      const digit = game.add.bitmapText(i * spacing, 0, style.font, '', style.size, this);
      digit.anchor.set(1, 0);
      return digit;
    });
    this.setNumber(initNumber);
  }

  setNumber(number) {
    const digits = padStart(number, this.props.numDigits, 0).split('');
    this.digits.forEach((digit, i) => {
      digit.text = digits[i];
    });
  }
}

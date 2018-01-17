import _ from 'lodash';
import 'gsap';

// Value Tweener is easy to use when you want components to tween their values.
// e.g. a bar graph when each bar displays it's value in text and from the length of the bar.
//      ValueTweener will help you tween the graph to it's target value.

class ValueTweener {

  constructor() {
    this.tweener = {
      value: 0,
    };
  }

  setValue(value) {
    this.tweener.value = value
  }

  tweenFromTo(duration, _from, _to, callback, context, options) {
    this.callback = callback;
    this.context = context;
    TweenMax.killTweensOf(this.tweener);
    this.tweener.value = _from;
    this._handleUpdate();
    TweenMax.to(this.tweener, duration, _.extend({ value: _to, onUpdate: this._handleUpdate, onUpdateScope: this }, options));
  }

  tweenTo(duration, _to, callback, context, options) {
    this.tweenFromTo(duration, this.tweener.value, _to, callback, context, options);
  }

  _handleUpdate() {
    this.callback.apply(this.context, [this.tweener.value]);
  }

}

export default ValueTweener;

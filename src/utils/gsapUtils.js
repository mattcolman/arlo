const { TweenMax } = window;

export function groupTween(tween, group) {
  tween.data.group = { ...tween.data, group };
  return tween;
}

export function killTweensInGroup(group) {
  TweenMax.getAllTweens().forEach((tween) => {
    if (get(tween, 'data.group') === group) {
      tween.kill();
    }
  });
}

export function killChildTweens(tweens) {
  tweens.forEach((tween) => {
    if (tween.getChildren) {
      killChildTweens(tween.getChildren())
    }
  });
}

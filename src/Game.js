import Phaser from 'phaser';

export default class extends Phaser.Game {
  constructor(config, props) {
    super(config);
    this.props = props;
    const componentDidUpdate = new Phaser.Signal();
    componentDidUpdate.add(this.componentDidUpdate, this);
    this.signals = { componentDidUpdate };
  }

  destroy() {
    this.signals.componentDidUpdate.dispose();
    this.signals = null;
    this.props = null;
    super.destroy();
  }

  componentDidUpdate(nextProps) {
    const prevProps = { ...this.props };
    const currentState = this.state.getCurrentState();
    const componentDidUpdate = currentState.componentDidUpdate;
    this.props = {
      ...this.props,
      ...nextProps,
    };
    if (componentDidUpdate) componentDidUpdate.call(currentState, prevProps);
  }
}

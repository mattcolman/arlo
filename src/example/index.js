import JackpotSlots from '../index';

function init() {
  const game = JackpotSlots.create('main', {
    isDesktop: true,
    // unlockTime: 1499627684557,
    freeTicketsRemaining: 10,
    spinsRemaining: 2,
    spinCount: 1,
    onSpin: () => {
      setTimeout(() => {
        game.signals.componentDidUpdate.dispatch({
          result: { sport: 'afl' },
          spinCount: 2,
          spinsRemaining: 1,
        });
      }, 2000);
    },
    onSpinComplete: () => {
      console.log('spin complete!!')
    },
  });
  // JackpotSlots.create('mainMobile', {
  //   isDesktop: false,
  //   // unlockTime: 1499627684557,
  //   freeTicketsRemaining: 10,
  //   spinsRemaining: 0,
  // });
  // JackpotSlots.createVictory('victory', {
  //   isDesktop: true,
  // });
  // JackpotSlots.createVictory('victoryMobile', {
  //   isDesktop: false,
  // });
}

console.log('go!!')
init();

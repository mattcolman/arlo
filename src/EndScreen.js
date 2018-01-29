import React, { Component } from 'react';
import glamorous, { Div, Span } from 'glamorous';
import numeral from 'numeral';
import { css } from 'glamor';
import congratsImg from '../assets/images/congrats.png';
import '../assets/fonts/ubuntu/stylesheet.css';
import logoImage from '../assets/images/logo-header.png';
import playChipSVG from '../assets/images/icon-playchip.svg';
import depositSVG from '../assets/images/deposit_button.svg';

const modalEnter = css.keyframes({
  from: { opacity: 0, transform: 'scale(0.5)' },
  to: { opacity: 1, transform: 'scale(1)' },
});

const fadeIn = css.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const Modal = glamorous.div({
  animation: `${fadeIn} 0.2s`,
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const PlayChip = glamorous('img', {
  withProps: {
    src: playChipSVG,
    alt: 'PlayChip',
  },
})({
  display: 'inline-block',
  height: '1.1em',
  width: '1.1em',
  marginTop: '-0.14em',
  marginRight: '0.15em',
  verticalAlign: 'middle',
});

const Container = glamorous.div({
  animation: `${modalEnter} 0.2s cubic-bezier(1,.01,.1,1.32)`,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  // margin: 10,
  // paddingTop: 20,
  maxWidth: 600,
  backgroundColor: '#144661',
  borderRadius: 8,
  // border: '10px solid #f5b84f',
  color: 'white',
  fontWeight: 500,
  maxHeight: '90vh',
  // overflow: 'scroll',
});

const CongratsBanner = glamorous.img({
  width: 'auto',
  height: 90,
  position: 'absolute',
  top: -20,
  left: '50%',
  transform: 'translateX(-50%)',
});

const TextContainer = glamorous.div({
  padding: 20,
  paddingTop: 0,
  textAlign: 'center',
});

const Text = glamorous.div({
  fontSize: 13,
  padding: 3,
  '@media (min-width: 1281px)': {
    fontSize: 18,
  },
});

const Bold = glamorous.span({
  fontWeight: 700,
  fontSize: 17,
  '@media (min-width: 1281px)': {
    fontSize: 22,
  },
});

const Footer = glamorous.div({
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  height: 40,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 10,
});

const Logo = glamorous.img({
  height: 25,
});

const Flex = glamorous.div({
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 6,
});

// const rotation = css.keyframes({
//   from: {
//     transform: 'rotate(0deg)',
//   },
//   to: {
//     transform: 'rotate(359deg)',
//   },
// });

// const Spinner = glamorous.div({
//   animation: `${rotation} .6s infinite linear`,
//   borderRadius: '100%',
//   display: 'flex',
//   marginLeft: 'auto',
//   marginRight: 'auto',
//   borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
//   borderLeft: '2px solid rgba(255, 255, 255, 0.3)',
//   borderRight: '2px solid rgba(255, 255, 255, 0.3)',
//   borderTop: '2px solid rgba(255, 255, 255, 1)',
//   height: 30,
//   width: 30,
//   marginBottom: 30,
//   marginTop: 10,
// });

const InputContainer = glamorous.div({
  display: 'flex',
  justifyContent: 'center',
  padding: 6,
  maxWidth: 300,
  margin: '0 auto',
});

const Prefix = glamorous.div({
  backgroundColor: 'grey',
  borderRadius: '8px 0 0 8px',
  padding: 10,
});

const StyledInput = glamorous.input({
  borderRadius: '0 8px 8px 0',
  flexGrow: 1,
});

const Well = glamorous.div({
  backgroundColor: '#196789',
  borderRadius: 8,
  padding: 10,
});

const SmallButton = glamorous.button({
  padding: 6,
  backgroundColor: '#333',
  color: 'white',
  flex: 1,
});

const pulse = css.keyframes({
  '0%': {
    transform: 'scale(0.9)',
  },
  '50%': {
    transform: 'scale(1)',
  },
  '100%': {
    transform: 'scale(0.9)',
  },
});

const DepositButton = glamorous.button({
  backgroundImage: `url(${depositSVG})`,
  backgroundColor: 'transparent',
  border: 'none',
  width: 185,
  height: 80,
  animation: `${pulse} 2s infinite ease-in-out`,
});

const OverflowContainer = glamorous.div({
  marginTop: 50,
  overflow: 'scroll',
  height: '100%',
});

class EndScreen extends Component {
  state = { depositAmount: 100 };

  handleButtonClick() {
    // window.open();
  }

  render() {
    const { depositAmount } = this.state;
    return (
      <Modal>
        <Container>
          <CongratsBanner src={congratsImg} />
          <OverflowContainer>
            <TextContainer>
              <Text>
                {"Spend a minimum of $100 and we'll credit you an extra "}
                <Bold>230% PlayChips!</Bold>
              </Text>
              <Text>
                How much would you like to spend?
                <form>
                  <InputContainer>
                    <SmallButton
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.setState({ depositAmount: 100 });
                      }}
                    >
                      $100
                    </SmallButton>
                    <SmallButton
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.setState({ depositAmount: 500 });
                      }}
                    >
                      $500
                    </SmallButton>
                    <SmallButton
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        this.setState({ depositAmount: 1000 });
                      }}
                    >
                      $1,000
                    </SmallButton>
                  </InputContainer>
                  <InputContainer>
                    <Prefix>USD$</Prefix>
                    <StyledInput
                      type="number"
                      value={depositAmount}
                      onChange={(e) => {
                        this.setState({ depositAmount: Math.max(100, e.target.value) });
                      }}
                    />
                  </InputContainer>
                  <Flex>
                    <Span padding="0 6px">You will receive</Span>
                    <Well>
                      <PlayChip />
                      {numeral(depositAmount * 100).format('0,0')}
                    </Well>
                    <Span padding="0 6px">PLUS a bonus</Span>
                    <Well>
                      <PlayChip />
                      {numeral(depositAmount * 230).format('0,0')}
                    </Well>
                  </Flex>
                  <DepositButton
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  />
                </form>
              </Text>
            </TextContainer>
          </OverflowContainer>
          <Footer>
            <Logo src={logoImage} />
          </Footer>
        </Container>
      </Modal>
    );
  }
}

export default EndScreen;

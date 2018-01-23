import React, { Component } from 'react';
import glamorous, { Div } from 'glamorous';
import { css } from 'glamor';
import congratsImg from '../assets/images/congrats.png';
import '../assets/fonts/ubuntu/stylesheet.css';
import logoImage from '../assets/images/logo-header.png';

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
  backgroundColor: 'rgba(0, 0, 0, 0.25)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const Container = glamorous.div({
  animation: `${modalEnter} 0.2s cubic-bezier(1,.01,.1,1.32)`,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  margin: 10,
  paddingTop: 20,
  maxWidth: 500,
  backgroundColor: '#144661',
  borderRadius: 8,
  border: '10px solid #f5b84f',
  color: 'white',
  fontWeight: 500,
});

const CongratsBanner = glamorous.img({
  width: 'auto',
  height: 120,
  position: 'absolute',
  top: -55,
  left: '50%',
  transform: 'translateX(-50%)',
});

const TextContainer = glamorous.div({
  padding: 20,
  textAlign: 'center',
});

const Text = glamorous.div({
  fontSize: 13,
  padding: 5,
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

const ButtonsContainer = glamorous.div({
  display: 'flex',
  justifyContent: 'center',
  padding: 10,
  paddingBottom: 20,
});

const Button = glamorous.button({
  borderRadius: 8,
  padding: 10,
  textAlign: 'center',
  color: 'white',
  border: 'none',
  marginLeft: 10,
  marginRight: 10,
  textTransform: 'uppercase',
  width: 120,
  cursor: 'pointer',
});

const PrimaryButton = glamorous(Button)({
  backgroundColor: '#1d668b',
  '&:hover': {
    backgroundColor: '#3587b1',
  },
});

const SecondaryButton = glamorous(Button)({
  backgroundColor: '#f15133',
  '&:hover': {
    backgroundColor: '#ff8758',
  },
});

const BareButton = glamorous.button({
  backgroundColor: 'inherit',
  color: 'white',
  border: 'none',
  padding: 0,
  paddingLeft: 6,
  paddingBottom: 20,
  cursor: 'pointer',
  textTransform: 'uppercase',
  textDecoration: 'underline',
  '&:hover': {
    opacity: 0.8,
  },
});

const BottomSection = glamorous.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const Link = glamorous.a({
  color: 'white',
  textDecoration: 'underline',
  '&:hover': {
    opacity: 0.8,
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

const rotation = css.keyframes({
  from: {
    transform: 'rotate(0deg)',
  },
  to: {
    transform: 'rotate(359deg)',
  },
});

const Spinner = glamorous.div({
  animation: `${rotation} .6s infinite linear`,
  borderRadius: '100%',
  display: 'flex',
  marginLeft: 'auto',
  marginRight: 'auto',
  borderBottom: '2px solid rgba(255, 255, 255, 0.3)',
  borderLeft: '2px solid rgba(255, 255, 255, 0.3)',
  borderRight: '2px solid rgba(255, 255, 255, 0.3)',
  borderTop: '2px solid rgba(255, 255, 255, 1)',
  height: 30,
  width: 30,
  marginBottom: 30,
  marginTop: 10,
});

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
  backgroundColor: '#999',
  borderRadius: 8,
  padding: 10,
});

const SmallButton = glamorous.button({
  padding: 10,
  backgroundColor: '#333',
  color: 'white',
  flex: 1,
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
          <TextContainer>
            <Text>
              <span>
                <p>
                  <Bold>You've won a bonus 230%!</Bold>
                </p>
                <p>
                  Spend a minimum of $100 now and we'll credit you an extra{' '}
                  <Bold>230% PlayChips!</Bold>
                </p>
              </span>
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
                    $1000
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
                <TextContainer>
                  You will receive
                  <Well>{depositAmount * 100}</Well>
                  PLUS
                  <Well>{depositAmount * 230}</Well>
                </TextContainer>
                <PrimaryButton
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  Deposit
                </PrimaryButton>
              </form>
            </Text>
          </TextContainer>
          <Footer>
            <Logo src={logoImage} />
          </Footer>
        </Container>
      </Modal>
    );
  }
}

export default EndScreen;

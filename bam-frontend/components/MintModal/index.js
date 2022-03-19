import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import moment from 'moment';
import { Spin, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Clock from '../Clock';
import { useOnClickOutside } from '../../hooks';
import formatDate from '../../utils/format-date.js';
const antIcon = <LoadingOutlined style={{ fontSize: 36 }} spin />;
const antIconSm = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const BaseModal = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  z-index: 2;
  justify-content: center;
  align-items: flex-start;
  background: #0006;
  visibility: ${(props) => (props?.open ? 'visible' : 'hidden')};
  /* transition: visibility 0s linear 300ms, opacity 400ms; */
  opacity: ${({ open }) => (open ? 1 : 0)};
  pointer-events: ${({ open }) => (open ? 'auto' : 'none')};
  will-change: opacity;
  transition: opacity 0.1s ease-in-out;
`;

const Modal = styled.div`
  background: #fff;
  color: #000;
  border-radius: 20px;
  margin-top: 1rem;
  position: relative;
  max-width: 100%;
  z-index: 3;
  /* margin-top: 430px; */
  margin-top: 30vh;
`;

const Body = styled.div`
  min-width: 300px;
  max-width: 400px;
  padding: 2rem;

  @media (max-width: 767px) {
    max-width: 300px;
  }
`;

const Head = styled.video`
  display: block;
  margin: -12rem auto 0;
  max-width: 80%;
`;

const Close = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  cursor: pointer;
  z-index: 1;
`;

const Svg = styled.svg`
  overflow: visible;
  width: 0.6875em;
  vertical-align: -0.225em;
  fill: #0007;
  font-size: 1.33333em;
  line-height: 0.75em;
  display: inline-block;
  height: 1em;
`;

const H1 = styled.h1`
  text-align: center;
`;

const H3 = styled.h3`
  text-align: center;
`;

const H4 = styled.h4`
  text-align: center;
`;

const H5 = styled.h5`
  text-align: center;
`;

const H6 = styled.h6`
  text-align: center;
`;

const Form = styled.div`
  justify-content: center;
  /* align-items: center; */
  display: flex;
`;

const FormBody = styled.div`
  text-align: center;
  max-width: 300px;
`;

const Quantity = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 1rem;
  margin-top: 1rem;
`;

const QuantityItem = styled.div`
  border: 1px solid #e6e6e6;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  text-align: center;
  cursor: pointer;
  background: ${(props) => (props?.active ? '#464270' : '#fff')};
  /* background: ${(props) => (props?.active ? '#ee6226' : '#fff')}; */
  color: ${(props) => (props?.active ? 'hsla(0, 0%, 100%, 0.9)' : '#000')}; ;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  box-sizing: border-box;
  padding: 0.5rem 1rem;
  margin: 0.5rem 0 0;
  border: 1px solid #e6e6e6;
  border-radius: 0.5rem;
  outline: none;
  padding-right: 4rem;
  width: 100%;
  text-align: center;
`;

const InputDecoration = styled.span`
  position: absolute;
  top: 1.25rem;
  right: 0.5rem;
  margin-left: -3rem;
  /* color: #ee6226; */
  color: #464270;
  font-size: 0.8125rem;
  cursor: pointer;
  float: right !important;
`;

const PurchaseBtn = styled.button`
  font-weight: 700;
  /* background: #ee6226; */
  background: #464270;
  color: hsla(0, 0%, 100%, 0.9);
  padding: 0.5rem 1.5rem;
  display: inline-block;
  margin: 1rem auto 0;
  border: 0;
  text-decoration: none;
  border-radius: 2rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.1s;
  min-width: 200px;
`;

const MintModal = ({
  onOpen = () => {},
  onClose = () => {},
  onConnect = () => {},
  setAmount = () => {},
  amount,
  open,
  connected,
  connecting,
  totalSupply,
  web3,
  price,
  claimable,
  onClaim = () => {},
  onMint = () => {},
  onMinted = () => {},
  minting,
  maxSupply,
  isMinted,
  setIsMinted,
  freeMintReserve,
  maxFreeMintReserve,
}) => {
  const [cur, setCur] = useState(2);
  const [selectMint, setSelectMint] = useState(false);
  const [curDate, setCurDate] = useState(moment());
  const [timeObj, setTimeObj] = useState({});
  const intervalRef = useRef(null);

  const handleClose = () => {
    if (minting) return;
    setSelectMint(false);
    onClose();
  };

  const wrapperRef = useRef(null);

  useOnClickOutside(wrapperRef, handleClose);

  const handleClickQuantityItem = (n) => () => {
    if (minting) return;
    setAmount(n);
    setCur(n);
  };

  useEffect(() => {
    if (open) {
      onOpen();
    }
  }, [open]);

  const handleCountdown = () => {
    const nowT = moment();
    const targetDay = moment(process.env.NEXT_PUBLIC_RELEASE_DATE);

    const timeObj = formatDate(targetDay);

    setCurDate(moment());
    setTimeObj(timeObj);
    // console.log('handleCountdown', nowT.format());
    if (!nowT.isBefore(targetDay)) {
      console.log('clear');
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(handleCountdown, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  const renderForm = () => {
    if (curDate.isBefore(moment(process.env.NEXT_PUBLIC_RELEASE_DATE))) {
      return (
        <>
          <H3>start in</H3>
          <Clock
            d={timeObj?.count_days ?? 0}
            h={timeObj?.count_hours ?? 0}
            m={timeObj?.count_minutes ?? 0}
            s={timeObj?.count_seconds ?? 0}
          />
        </>
      );
    }

    if (connecting) {
      return (
        <Spin
          style={{ display: 'block', margin: '1rem auto 0' }}
          indicator={antIcon}
        />
      );
    }

    if (!connected) {
      return (
        <Form>
          <FormBody>
            <PurchaseBtn onClick={onConnect} style={{ minWidth: '250px' }}>
              Connect Wallet
            </PurchaseBtn>
          </FormBody>
        </Form>
      );
    }

    if (isMinted) {
      return (
        <>
          <Form>
            <FormBody>
              <PurchaseBtn onClick={onMinted} style={{ minWidth: '250px' }}>
                Continue Minting
              </PurchaseBtn>
            </FormBody>
          </Form>
        </>
      );
    }

    if (claimable && !selectMint) {
      return (
        <>
          {/* <H3>{`${freeMintReserve.toLocaleString()}/${maxFreeMintReserve.toLocaleString()}`}</H3> */}
          <H3>{`${totalSupply.toLocaleString()}/${maxSupply.toLocaleString()}`}</H3>
          {minting ? (
            <Spin
              style={{ display: 'block', margin: '1rem auto 0' }}
              indicator={antIconSm}
            />
          ) : (
            <Form>
              <FormBody>
                <PurchaseBtn onClick={onClaim} style={{ minWidth: '250px' }}>
                  Claim Giveaway
                </PurchaseBtn>

                <H5 style={{ marginTop: '10px' }}>or</H5>
                <PurchaseBtn
                  onClick={() => setSelectMint(true)}
                  style={{ minWidth: '250px', marginTop: '5px' }}
                >
                  Purchase
                </PurchaseBtn>
              </FormBody>
            </Form>
          )}
        </>
      );
    }

    return (
      <>
        <H5>{`Minted ${totalSupply.toLocaleString()}/${maxSupply.toLocaleString()}`}</H5>
        <div style={{ textAlign: 'center' }}>{`${web3.utils.fromWei(
          _.toString(price),
          'ether',
        )} ETH`}</div>
        <Form>
          <FormBody>
            <Quantity>
              <QuantityItem
                disabled={minting}
                active={
                  _.toSafeInteger(amount) === 1 && _.toSafeInteger(cur) === 1
                }
                onClick={handleClickQuantityItem(1)}
              >
                1
              </QuantityItem>
              <QuantityItem
                disabled={minting}
                active={
                  _.toSafeInteger(amount) === 2 && _.toSafeInteger(cur) === 2
                }
                onClick={handleClickQuantityItem(2)}
              >
                2
              </QuantityItem>
              <QuantityItem
                disabled={minting}
                active={
                  _.toSafeInteger(amount) === 5 && _.toSafeInteger(cur) === 5
                }
                onClick={handleClickQuantityItem(5)}
              >
                5
              </QuantityItem>
              <QuantityItem
                disabled={minting}
                active={
                  _.toSafeInteger(amount) === 10 && _.toSafeInteger(cur) === 10
                }
                onClick={handleClickQuantityItem(10)}
              >
                10
              </QuantityItem>
            </Quantity>
            <InputWrapper>
              <Input
                disabled={minting}
                type="text"
                min="1"
                max="20"
                placeholder="Insert custom amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e?.target?.value);
                  setCur(0);
                }}
              />
              <InputDecoration>Max. 20</InputDecoration>
            </InputWrapper>
            {minting ? (
              <Spin
                style={{ display: 'block', margin: '1rem auto 0' }}
                indicator={antIconSm}
              />
            ) : (
              <>
                <PurchaseBtn onClick={onMint}>
                  {freeMintReserve !== 0 ? 'Mint' : 'Purchase'}
                </PurchaseBtn>
                {freeMintReserve !== 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      marginTop: '5px',
                      color: 'red',
                    }}
                  >{`Free Mint Reserve ${freeMintReserve.toLocaleString()}/${maxFreeMintReserve.toLocaleString()}`}</div>
                )}
              </>
            )}
          </FormBody>
        </Form>
      </>
    );
  };

  useEffect(() => {
    if (open) {
      setCur(amount);
    }
  }, [open]);

  return (
    <BaseModal open={open}>
      <Modal ref={wrapperRef}>
        <Body>
          <Close onClick={handleClose}>
            <Svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fas"
              data-icon="times"
              className="svg-inline--fa fa-times fa-w-11 fa-lg "
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 352 512"
            >
              <path
                fill="currentColor"
                d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"
              ></path>
            </Svg>
          </Close>

          <H1 style={{ marginTop: '20px', marginBottom: '20px' }}>
            <b>Mint BAMfers</b>
          </H1>
          {renderForm()}
        </Body>
      </Modal>
    </BaseModal>
  );
};

export default MintModal;

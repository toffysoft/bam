import React from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { notification, Row, Col, Slider } from 'antd';
import { BigNumber, ethers } from 'ethers';
import Web3Modal from 'web3modal';
// @ts-ignore
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';
import NavBar from '../components/NavBar';
import NFT from '../artifacts/contracts/BAMfers.json';
import styled from 'styled-components';

const MintModal = dynamic(() => import('../components/MintModal'), {
  ssr: false,
});

const Section = styled.section`
  position: relative;

  overflow: hidden;
  min-height: calc(100vh - 60px);
  padding: 90px 0px 0px;

  @media (max-width: 768px) {
    padding: 0px !important;
  }
`;

const ContentRow = styled(Row)`
  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const ContentWrapper = styled(Col)`
  display: flex;
  flex-direction: column;
  position: relative;
  justify-content: center;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    padding-top: 0px !important;
  }
`;

const Video = styled.video`
  width: 90%;
  display: block;
  margin-left: auto;
  margin-right: 0;
  clear: both;

  @media (max-width: 768px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const Paragraph = styled.p`
  color: #464270;
  width: 100%;
  padding: 0px 60px;
  font-size: 1vw;

  @media (max-width: 1920px) {
    font-size: 1.6vw;
  }

  @media (max-width: 1168px) {
    font-size: 3vw;
  }

  @media (max-width: 767px) {
    font-size: 4vw;
  }
`;

const Container = styled.div`
  position: relative;
  background-color: #ebe8e3;
  /* overflow: hidden; */
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  background: url(/images/main-bg.png);
  background-size: 100% 100%;
  background-repeat: no-repeat;

  width: 50%;
  height: 50%;

  @media (max-width: 1920px) {
    width: 60%;
    height: 60%;
  }

  @media (max-width: 1024px) {
    width: 50%;
    height: 50%;
  }

  @media (max-width: 425px) {
    width: 30%;
    height: 30%;
  }
`;

const Main = styled.main`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 8vh;
`;

const Title = styled.span`
  color: #464270;
  font-size: 8vmin;
  margin: 0;
  font-weight: 100;
  @media (max-width: 1024px) {
    font-size: 6vmin;
  }
`;

const Desc = styled.span`
  color: #464270;
  font-size: 1.2rem;
  margin: 0;
  font-weight: 100;
  margin: 1vmin;

  @media (max-width: 1024px) {
    /* font-size: 6vmin; */
  }
`;

const Button = styled.button`
  /* width: 341px;
  background-color: #464270;
  color: #fff;
  cursor: pointer;
  font-family: Spot Mono;
  font-size: 8vmin;

  @media (max-width: 1024px) {
    font-size: 6vmin;
  }
  @media (max-width: 425px) {
    width: 170px;
  } */

  background-color: #464270;
  border: none;
  color: #fff !important;
  padding: 0.7rem 2rem;
  letter-spacing: 2px;
  border-radius: 0;
  font-family: Spot Mono;
  font-weight: 600;
  font-size: 2rem;
  margin-top: 10px;
  text-decoration: none;
  display: inline-block;
`;

const BigTitle = styled.h1`
  color: #464270;
  font-size: 15vmin;
  margin: 0;
  line-height: 0.7;
  @media (max-width: 1024px) {
    font-size: 8vmin;
  }
`;

const SubTitle = styled.h2`
  color: #464270;
  font-size: 8vmin;
  margin: 0;
  @media (max-width: 1440px) {
    font-size: 6vmin;
  }
  @media (max-width: 1024px) {
    font-size: 5vmin;
  }
`;

const openNotification = (title, message) => {
  notification.error({
    message: title,
    description: message,
  });
};

let Errors = {};

function initWeb3(provider) {
  const web3 = new Web3(provider);

  web3.eth.extend({
    methods: [
      {
        name: 'chainId',
        call: 'eth_chainId',
        outputFormatter: web3.utils.hexToNumber,
      },
    ],
  });

  const QuantityToMintTooHigh = web3.eth.abi.encodeFunctionSignature(
    'QuantityToMintTooHigh()',
  );
  const MaxSupplyExceeded = web3.eth.abi.encodeFunctionSignature(
    'MaxSupplyExceeded()',
  );
  const FreeMintReserveExceeded = web3.eth.abi.encodeFunctionSignature(
    'FreeMintReserveExceeded()',
  );
  const InsufficientFunds = web3.eth.abi.encodeFunctionSignature(
    'InsufficientFunds()',
  );
  const SaleIsNotActive =
    web3.eth.abi.encodeFunctionSignature('SaleIsNotActive()');
  const ApprovalQueryForNonexistentToken = web3.eth.abi.encodeFunctionSignature(
    'ApprovalQueryForNonexistentToken()',
  );
  const ApproveToCaller =
    web3.eth.abi.encodeFunctionSignature('ApproveToCaller()');
  const ApprovalToCurrentOwner = web3.eth.abi.encodeFunctionSignature(
    'ApprovalToCurrentOwner()',
  );
  const BalanceQueryForZeroAddress = web3.eth.abi.encodeFunctionSignature(
    'BalanceQueryForZeroAddress()',
  );
  const MintedQueryForZeroAddress = web3.eth.abi.encodeFunctionSignature(
    'MintedQueryForZeroAddress()',
  );
  const BurnedQueryForZeroAddress = web3.eth.abi.encodeFunctionSignature(
    'BurnedQueryForZeroAddress()',
  );
  const AuxQueryForZeroAddress = web3.eth.abi.encodeFunctionSignature(
    'AuxQueryForZeroAddress()',
  );
  const MintToZeroAddress = web3.eth.abi.encodeFunctionSignature(
    'MintToZeroAddress()',
  );
  const MintZeroQuantity =
    web3.eth.abi.encodeFunctionSignature('MintZeroQuantity()');
  const OwnerIndexOutOfBounds = web3.eth.abi.encodeFunctionSignature(
    'OwnerIndexOutOfBounds()',
  );
  const OwnerQueryForNonexistentToken = web3.eth.abi.encodeFunctionSignature(
    'OwnerQueryForNonexistentToken()',
  );
  const TokenIndexOutOfBounds = web3.eth.abi.encodeFunctionSignature(
    'TokenIndexOutOfBounds()',
  );
  const TransferCallerNotOwnerNorApproved =
    web3.eth.abi.encodeFunctionSignature('TransferCallerNotOwnerNorApproved()');
  const TransferFromIncorrectOwner = web3.eth.abi.encodeFunctionSignature(
    'TransferFromIncorrectOwner()',
  );
  const TransferToNonERC721ReceiverImplementer =
    web3.eth.abi.encodeFunctionSignature(
      'TransferToNonERC721ReceiverImplementer()',
    );
  const TransferToZeroAddress = web3.eth.abi.encodeFunctionSignature(
    'TransferToZeroAddress()',
  );
  const URIQueryForNonexistentToken = web3.eth.abi.encodeFunctionSignature(
    'URIQueryForNonexistentToken()',
  );
  const TheCallerIsAnotherContract = web3.eth.abi.encodeFunctionSignature(
    'TheCallerIsAnotherContract()',
  );

  Errors = {
    [QuantityToMintTooHigh]: 'QuantityToMintTooHigh',
    [MaxSupplyExceeded]: 'MaxSupplyExceeded',
    [FreeMintReserveExceeded]: 'FreeMintReserveExceeded',
    [InsufficientFunds]: 'InsufficientFunds',
    [SaleIsNotActive]: 'SaleIsNotActive',
    [ApprovalQueryForNonexistentToken]: 'ApprovalQueryForNonexistentToken',
    [ApproveToCaller]: 'ApproveToCaller',
    [ApprovalToCurrentOwner]: 'ApprovalToCurrentOwner',
    [BalanceQueryForZeroAddress]: 'BalanceQueryForZeroAddress',
    [MintedQueryForZeroAddress]: 'MintedQueryForZeroAddress',
    [BurnedQueryForZeroAddress]: 'BurnedQueryForZeroAddress',
    [AuxQueryForZeroAddress]: 'AuxQueryForZeroAddress',
    [MintToZeroAddress]: 'MintToZeroAddress',
    [MintZeroQuantity]: 'MintZeroQuantity',
    [OwnerIndexOutOfBounds]: 'OwnerIndexOutOfBounds',
    [OwnerQueryForNonexistentToken]: 'OwnerQueryForNonexistentToken',
    [TokenIndexOutOfBounds]: 'TokenIndexOutOfBounds',
    [TransferCallerNotOwnerNorApproved]: 'TransferCallerNotOwnerNorApproved',
    [TransferFromIncorrectOwner]: 'TransferFromIncorrectOwner',
    [TransferToNonERC721ReceiverImplementer]:
      'TransferToNonERC721ReceiverImplementer',
    [TransferToZeroAddress]: 'TransferToZeroAddress',
    [URIQueryForNonexistentToken]: 'URIQueryForNonexistentToken',
    [TheCallerIsAnotherContract]: 'TheCallerIsAnotherContract',
  };

  return web3;
}

function getProviderOptions() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: process.env.NEXT_PUBLIC_INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
          4: `https://rinkeby.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_ID}`,
          1337: `http://127.0.0.1:8545`,
        },
      },
    },
  };

  return providerOptions;
}

let web3Modal;
if (typeof window !== 'undefined') {
  web3Modal = new Web3Modal({
    network: 'mainnet',
    cacheProvider: true,
    // providerOptions: getProviderOptions(),
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function BAM() {
  const [chainId, setChainId] = React.useState(
    parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10),
  );

  const intvl = React.useRef(null);
  const [fetching, setFetching] = React.useState(false);
  const [connecting, setConnecting] = React.useState(false);
  const [minting, setMinting] = React.useState(false);
  const [address, setAddress] = React.useState('');
  const [web3, setWeb3] = React.useState(null);
  const [provider, setProvider] = React.useState(null);

  const [connected, setConnected] = React.useState(false);
  const [assets, setAssets] = React.useState([]);

  const [showModal, setShowModal] = React.useState(false);
  const [pendingRequest, setPendingRequest] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [nftContract, setNftContract] = React.useState(null);

  const [web3Provider, setWeb3Provider] = React.useState(null);
  const [signer, setSigner] = React.useState(null);
  const [err, setErr] = React.useState(null);
  const [bgColor, setBgColor] = React.useState(null);
  const [mintAble, setMintAble] = React.useState(false);
  const [isOwner, setIsOwner] = React.useState(false);
  const [whitelistTarget, setWhitelistTarget] = React.useState('');
  const [newOwnerTarget, setNewOwnerTarget] = React.useState('');
  const [toAddress, setToAddress] = React.useState('');
  const [sendToken, setSendToken] = React.useState('');
  const [amount, setAmount] = React.useState(2);
  const [price, setPrice] = React.useState('10000000000000000');
  const [isClaimable, setIsClaimable] = React.useState();
  const [totalSupply, setTotalSupply] = React.useState(0);
  const [freeMintReserve, setFreeMintReserve] = React.useState(333);
  const [maxFreeMintReserve, setMaxFreeMintReserve] = React.useState(333);
  const [maxSupply, setMaxSupply] = React.useState(3333);
  const [isMinted, setIsMinted] = React.useState(false);

  const onConnect = async () => {
    if (connected && provider && web3 && address) return;

    setConnecting(true);
    try {
      const provider = await web3Modal.connect();

      const Web3 = initWeb3(provider);

      const accounts = await Web3.eth.getAccounts();

      const address = accounts[0];

      const cId = await Web3.eth.net.getId();

      if (cId !== parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10)) {
        if (provider?.infuraId) {
          alert('Invalid Network!');

          return;
        }

        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${process.env.NEXT_PUBLIC_CHAIN_ID}` }], // chainId must be in hexadecimal numbers
        });
        setChainId(parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10));
      }

      setAddress(address);
      setChainId(cId);

      await subscribeProvider(provider, Web3);

      const web3Provider = new ethers.providers.Web3Provider(provider);

      const signer = web3Provider.getSigner();

      const nftContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        NFT.abi,
        signer,
      );

      const totalSupply = await nftContract.totalSupply();
      const freeMintReserve = await nftContract.freeMintReserve();

      setTotalSupply(totalSupply.toNumber());
      setFreeMintReserve(freeMintReserve.toNumber());
      setNftContract(nftContract);
      setWeb3Provider(web3Provider);
      setSigner(signer);
      setWeb3(Web3);
      setProvider(provider);

      setConnecting(false);
      setConnected(true);
    } catch (e) {
      console.log({ e });
      setConnecting(false);
      openNotification(e?.code ?? 'Error', e?.error?.message ?? e?.message);

      resetApp();
    }
  };

  const subscribeProvider = async (provider, W3) => {
    if (!provider.on) {
      return;
    }
    provider.on('disconnect', () => resetApp());
    provider.on('accountsChanged', async (accounts) => {
      setAddress(accounts[0]);
    });
    provider.on('chainChanged', async (chainId) => {
      const networkId = await W3.eth.net.getId();
      setChainId(parseInt(networkId, 10));
    });
  };

  const resetApp = async () => {
    try {
      if (web3 && web3.currentProvider && web3.currentProvider.close) {
        await web3.currentProvider.close();
      }
      setShowModal(false);
      setFetching(false);
      setAddress('');
      setWeb3(null);
      setProvider(null);
      setConnected(false);
      setChainId(parseInt(process.env.NEXT_PUBLIC_CHAIN_ID));
      setShowModal(false);
      setPendingRequest(false);
      setResult(null);
      setIsOwner(false);
      await web3Modal?.clearCachedProvider();
    } catch (e) {
      const originalError = e?.error?.data?.originalError;
      let msg;

      if (originalError) {
        msg = Errors?.[originalError?.data] ?? originalError?.message;
      }

      openNotification(
        e?.code ?? 'Error',
        msg ?? e?.error?.message ?? e?.message,
      );
    }
  };

  const handleCloseModal = async () => {
    try {
      setShowModal(false);
    } catch (e) {
      console.error({ e });

      const originalError = e?.error?.data?.originalError;
      let msg;

      if (originalError) {
        msg = Errors?.[originalError?.data] ?? originalError?.message;
      }

      openNotification(
        e?.code ?? 'Error',
        msg ?? e?.error?.message ?? e?.message,
      );
    }
  };

  const onOpen = async () => {
    setAmount(2);
    if (!connected || !provider || !web3 || !address) {
      setShowModal(true);
      return;
    }

    setConnecting(true);
    setShowModal(true);
    try {
      const totalSupply = await nftContract.totalSupply();
      const freeMintReserve = await nftContract.freeMintReserve();

      setTotalSupply(totalSupply.toNumber());
      setFreeMintReserve(freeMintReserve.toNumber());

      setConnecting(false);
    } catch (e) {
      console.log({ e });

      const originalError = e?.error?.data?.originalError;
      let msg;

      if (originalError) {
        msg = Errors?.[originalError?.data] ?? originalError?.message;
      }

      openNotification(
        e?.code ?? 'Error',
        msg ?? e?.error?.message ?? e?.message,
      );
    }
  };

  const mint = async () => {
    setMinting(true);
    try {
      const freeMintReserve = await nftContract.freeMintReserve();
      setFreeMintReserve(freeMintReserve.toNumber());

      if (freeMintReserve.toNumber() !== 0) {
        // console.log({ freeMintReserve: freeMintReserve.toNumber() });
        // if (amount > freeMintReserve.toNumber() - freeMintReserve.toNumber()) {
        //   throw new Error(
        //     `Free Mint Reserve : ${freeMintReserve.toLocaleString()}/${maxFreeMintReserve.toLocaleString()}`,
        //   );
        // }

        await nftContract.freeMint(amount);

        await sleep(10000);

        const totalSupply = await nftContract.totalSupply();
        setTotalSupply(totalSupply.toNumber());

        const freeMintReserve = await nftContract.freeMintReserve();
        setFreeMintReserve(freeMintReserve.toNumber());

        setMinting(false);
        setIsMinted(true);

        return;
      }

      const each = BigNumber.from(price);

      const options = { value: each.mul(amount).toString() };

      await nftContract.mint(amount, options);
      await sleep(10000);

      const totalSupply = await nftContract.totalSupply();
      setTotalSupply(totalSupply.toNumber());
      setMinting(false);
      setIsMinted(true);
    } catch (e) {
      console.error({ e });
      setMinting(false);
      const originalError = e?.error?.data?.originalError;
      let msg;

      if (originalError) {
        msg = Errors?.[originalError?.data] ?? originalError?.message;
      }

      openNotification(
        e?.code ?? 'Error',
        msg ?? e?.error?.message ?? e?.message,
      );
    }
  };

  const minted = async () => {
    setConnecting(true);
    try {
      const freeMintReserve = await nftContract.freeMintReserve();
      setFreeMintReserve(freeMintReserve.toNumber());
      const totalSupply = await nftContract.totalSupply();
      setTotalSupply(totalSupply.toNumber());
      setConnecting(false);
      setIsMinted(false);
    } catch (e) {
      console.error({ e });
      setConnecting(false);

      const originalError = e?.error?.data?.originalError;
      let msg;

      if (originalError) {
        msg = Errors?.[originalError?.data] ?? originalError?.message;
      }

      openNotification(
        e?.code ?? 'Error',
        msg ?? e?.error?.message ?? e?.message,
      );
    }
  };

  React.useEffect(() => {
    async function handleChangNetwork() {
      try {
        if (
          typeof window !== 'undefined' &&
          window?.ethereum &&
          chainId !== parseInt(process.env.NEXT_PUBLIC_CHAIN_ID, 10) &&
          connected
        ) {
          resetApp();
        }
      } catch (e) {
        console.log({ e });
        openNotification(e?.code ?? 'Error', e?.error?.message ?? e?.message);
        resetApp();
      }
    }

    handleChangNetwork();
  }, [chainId]);

  return (
    <>
      <MintModal
        onConnect={onConnect}
        setAmount={setAmount}
        amount={amount}
        open={showModal}
        onClose={handleCloseModal}
        connected={connected}
        connecting={connecting}
        price={price}
        web3={web3}
        totalSupply={totalSupply}
        freeMintReserve={freeMintReserve}
        maxSupply={maxSupply}
        maxFreeMintReserve={maxFreeMintReserve}
        onMint={mint}
        onMinted={minted}
        minting={minting}
        isMinted={isMinted}
        setIsMinted={setIsMinted}
      />
      <Head>
        <title>BAMfers</title>
        <meta
          name="description"
          content="3,333 Bored Azuki mfers. inspired by Azuki, Bored Ape Yacht Club, mfers. No official discord, No roadmap, No drama, Just mfers."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div>
          <div className="container">
            <NavBar />
          </div>
          <div className="main container">
            <div className="row">
              <div className="col-12">
                {/* <img
                  className="homePageImg_PC"
                  src="/images/main-bg.png"
                  alt="BAMfers"
                /> */}
                <video
                  autoPlay="autoplay"
                  loop="loop"
                  muted="muted"
                  className="homePageImg_PC"
                >
                  <source src="bam.webm" type="video/webm" />
                </video>
                <h2 className="mt-3 text-center">Bored Azuki mfers</h2>
                <p className="text-center">
                  <Button onClick={onOpen}>Mint</Button>
                </p>
                <p className="text-center">
                  <Desc>Price 0.01 ETH</Desc>
                </p>
              </div>
            </div>
            <div className="divider div-transparent"></div>
          </div>
          <div className="utility container">
            <div className="row">
              <div className="col-md-6 col-12 order-md-1 order-2">
                <h2>BAM!</h2>
                <h4>Bored Azuki mfers</h4>
                <p>
                  The collection is based on the Ethereum blockchain and
                  includes 3,333 Bored Azuki mfers with 201 traits.
                </p>
                <h4>We are the BAM!</h4>
                <p>
                  No official discord. No roadmap. No drama. Just mfing vibes!
                  Like Sartoshi said, “there is no king, ruler, or defined
                  roadmap and mfers can build whatever they can think of with
                  these mfers”.
                </p>
                <p>
                  <Button onClick={onOpen}>Mint</Button>
                </p>
                <p>
                  <Desc>Price 0.01 ETH</Desc>
                </p>
              </div>
              <div className="demo col-md-6 col-12 order-md-2 order-1">
                {/* <img alt="twitter" src="mfergirls.gif" /> */}
                <Video autoPlay loop muted>
                  <source src="/bamfers.mp4" type="video/mp4" />
                </Video>
              </div>
            </div>
          </div>
          <div className="divider div-transparent margin-bottom"></div>

          {/* <div className="divider div-transparent margin-bottom"></div> */}
        </div>
      </main>
      <footer className="text-center text-capitalize">
        <div className="container">
          <div className="row">
            <div className="col-sm-3 col-2"></div>
            <div className="social-icons col-sm-3 col-4">
              <a
                href="https://twitter.com/xxxMfers"
                target="_blank"
                rel="noreferrer"
              >
                <img alt="twitter" src="/images/twitter.png" />
              </a>
            </div>
            <div className="social-icons col-sm-3 col-4">
              <a
                href="https://opensea.io/collection/bam-nft"
                target="_blank"
                rel="noreferrer"
              >
                <img alt="opensea" src="/images/opensea.png" />
              </a>
            </div>
            <div className="col-sm-3 col-2"></div>
          </div>
        </div>
      </footer>
    </>
  );
}

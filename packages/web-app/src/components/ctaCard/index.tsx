import React, {useState} from 'react';
import styled from 'styled-components';
import {ButtonText} from '@aragon/ui-components';
import useScreen from 'hooks/useScreen';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import secrets from '../../../../../secret.json';
import {useAuth0} from '@auth0/auth0-react';
import './style.css';
import abi from '../../../../../abi/abi.json';
import globalAbi from '../../../../../abi/globalAbi.json';
import Web3 from 'web3';
import {useWallet} from 'hooks/useWallet';
import {Web3Provider} from '@ethersproject/providers';
import {ethers} from 'ethers';
import {useNewWallet} from 'hooks/useNewWallet';
import {encodeStringToInt} from 'utils/idUnified';
import ClipLoader from 'react-spinners/ClipLoader';

type Props = {
  // temporary property, to be removed once all actions available
  actionAvailable?: boolean;
  actionLabel: string;
  className?: string;
  path: string;
  imgSrc: string;
  onClick: (path: string) => void;
  subtitle: string;
  title: string;
};

const CTACard: React.FC<Props> = props => {
  const [value, setValue] = React.useState('');
  const [selectedLocation, setSelectedLocation] = React.useState('');
  const [selectedCountry, setSelectedCountry] = React.useState(null);
  const [selectedRegion, setSelectedRegion] = React.useState(null);

  const geocoderRef = React.useRef<MapboxGeocoder | null>(null);

  React.useEffect(() => {
    const geocoder = new MapboxGeocoder({
      accessToken: secrets.MAPBOX_API_KEY,
      placeholder: 'Enter your location',
      render: (item: any) => {
        // override the default suggestion item rendering to preserve the comma separator
        return `<div style="white-space: nowrap;">${item.place_name}</div>`;
      },
    });

    geocoder.on('result', e => {
      setSelectedLocation(e.result.place_name);

      console.log(e.result.context);
      for (const feature of e.result.context) {
        if (feature.id.startsWith('country.')) {
          console.log(feature.id.replace('country.', ''));
          setSelectedCountry(feature.id.replace('country.', ''));
        } else if (feature.id.startsWith('region.')) {
          console.log(feature.id.replace('region.', ''));
          setSelectedRegion(feature.id.replace('region.', ''));
        }
      }
    });

    const inputContainer = document.getElementById('geocoder-input-container');
    if (inputContainer) inputContainer.appendChild(geocoder.onAdd());

    // save the geocoder instance to the ref
    geocoderRef.current = geocoder;
  }, []);

  React.useEffect(() => {
    if (geocoderRef.current) {
      const inputElement = geocoderRef.current._inputEl;
      if (inputElement) {
        inputElement.style.width = '1000px';
      }
    }
  }, [geocoderRef.current]);

  const {isDesktop} = useScreen();
  const {loginWithRedirect, isAuthenticated, user, logout} = useAuth0();
  const [mintPageVisible, setMintPageVisible] = React.useState(false);
  const [isTOSChecked, setIsTOSChecked] = React.useState(false);
  const {web3, account, balance, network, networkId, error} = useNewWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNft, setMintedNft] = useState(false);
  console.log('isAuthenticated', isAuthenticated);
  console.log('user', user);

  const contractAddress = secrets.CONTRACT_ADDRESS;

  const getUnifiedId = () => {
    const builtString = `${selectedCountry}-${selectedRegion}}`;
    return encodeStringToInt(builtString);
  };

  if (error) {
    console.log('error occured in connect wallet', error);
  }

  async function mintNFT() {
    if (!window.ethereum) {
      alert('Please install Metamask');
      return;
    }
    setIsMinting(true);

    // const globalContract = new web3.eth.Contract(globalAbi, secrets.GLOBAL_CONTRACT_ADDRESS);

    const contract = new web3.eth.Contract(abi, contractAddress);

    const id = parseInt(selectedCountry);

    const tx = await contract.methods.mint(account, id, 1, '0x').encodeABI();
    const gasLimit = await web3.eth.estimateGas({
      to: contractAddress,
      data: tx,
    });

    const transaction = {
      to: contractAddress,
      gas: gasLimit,
      data: tx,
      from: account,
    };

    const txReceipt = await web3.eth.sendTransaction(transaction);
    console.log(`NFT minted! Transaction hash: ${txReceipt.transactionHash}`);
    setMintedNft(true);
    setIsMinting(false);
  }

  return (
    <CTACardWrapper className={props.className}>
      {mintedNft ? (
        <>
          <div className="mb-4 text-center title">
            <h2>
              {`Congratulations, you’re citizen #1 of ${selectedLocation}.`}
            </h2>
          </div>
          <div>
            {
              'As the first citizen, you’ll automatically receive a Regional Leader NFT which will grant you special access to the Regional Leaders Discord channel [insert link]. Please note that this NFT is temporary and may be allocated to another citizen in the future, should they be elected as Regional Leader. '
            }
          </div>
        </>
      ) : (
        <>
          {!mintPageVisible && (!isAuthenticated || !selectedLocation) ? (
            <>
              <Content>
                <StyledImg src={props.imgSrc} />
                <Title>{props.title}</Title>
                <Subtitle>{props.subtitle}</Subtitle>
              </Content>

              <div
                id="geocoder-input-container"
                style={{
                  width: '100%',
                  border: '1px solid #eaeaea',
                  whiteSpace: 'nowrap',
                }}
              />

              {/* <ButtonText
        size="large"
        label={props.actionLabel}
        {...(props.actionAvailable
          ? { mode: 'primary' }
          : { mode: 'ghost', disabled: true })}
        onClick={() => props.onClick(selectedLocation)}
        className={`${!isDesktop && 'w-full'}`}
      /> */}
              <ButtonText
                size="large"
                label="Let's Go"
                onClick={() => {
                  if (!selectedLocation) {
                    alert('Please enter a location');
                    return;
                  } else {
                    setMintPageVisible(true);
                  }
                }}
              />
            </>
          ) : (
            <>
              <Content>
                <Title>Verify you are human</Title>
                <Subtitle>
                  We are using Auth0 and twilio to verify you are human.
                </Subtitle>
              </Content>

              {isAuthenticated ? (
                <ButtonText
                  size="large"
                  label="Logout"
                  onClick={() =>
                    logout({logoutParams: {returnTo: window.location.origin}})
                  }
                />
              ) : (
                <ButtonText
                  size="large"
                  label="Login"
                  onClick={() => loginWithRedirect()}
                />
              )}

              <>
                <label htmlFor="terms" className="text-ui-600 ft-text-base">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    value="terms"
                    className="mr-2"
                    checked={isTOSChecked}
                    onChange={() => setIsTOSChecked(!isTOSChecked)}
                  />
                  I have read and accept the{' '}
                  <a
                    href=" https://docs.google.com/document/d/1KDtJ6zE9ATbsnModGbRiX_a6go9VJnuY/edit?usp=sharing&ouid=103669077276191563899&rtpof=true&sd=true"
                    style={{color: 'blue', textDecoration: 'underline'}}
                  >
                    Aragon DAO Participation Agreement.
                  </a>
                </label>
              </>
              {!isMinting ? (
                <ButtonText
                  size="large"
                  label="Mint NFT"
                  disabled={!isTOSChecked || !isAuthenticated}
                  onClick={async () => await mintNFT()}
                />
              ) : (
                <ClipLoader color="#000" loading={true} size={150} />
              )}
            </>
          )}
        </>
      )}
    </CTACardWrapper>
  );
};

export default CTACard;

const CTACardWrapper = styled.div.attrs({
  className:
    'flex flex-col desktop:items-start items-center p-3 space-y-3 rounded-xl relative desktop:m-0 mb-3 mx-1' as string,
})`
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(50px);
`;

const Content = styled.div.attrs({
  className: 'flex desktop:items-start items-center flex-col desktop:m-0 mb-3',
})``;

const Title = styled.p.attrs({
  className: 'ft-text-2xl font-bold text-ui-800 desktop:mt-2 mt-0',
})``;

const Subtitle = styled.p.attrs({
  className: 'text-ui-600 h-9 ft-text-base desktop:mt-2 mt-1.5',
})``;

const StyledImg = styled.img.attrs({
  className: 'h-12 w-12',
})``;

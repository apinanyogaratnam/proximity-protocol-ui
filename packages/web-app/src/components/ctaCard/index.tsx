import React from 'react';
import styled from 'styled-components';
import {ButtonText} from '@aragon/ui-components';
import useScreen from 'hooks/useScreen';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import secrets from '../../../../../secret.json';
import {useAuth0} from '@auth0/auth0-react';
import './style.css';

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

  const geocoderRef = React.useRef<MapboxGeocoder | null>(null);

  React.useEffect(() => {
    const geocoder = new MapboxGeocoder({
      accessToken: secrets.MAPBOX_API_KEY,
      placeholder: 'Enter your location',
      render: (item: any) => {
        // override the default suggestion item rendering to preserve the comma separator
        return `<div style="white-space: nowrap;">${item.place_name}</div>`;
      }
    });

    geocoder.on('result', e => {
      setSelectedLocation(e.result.place_name);
    });

    const inputContainer = document.getElementById('geocoder-input-container');
    inputContainer.appendChild(geocoder.onAdd());

    // save the geocoder instance to the ref
    geocoderRef.current = geocoder;
  }, []);

  React.useEffect(() => {
    if (geocoderRef.current) {
      const inputElement = geocoderRef.current._inputEl;
      if (inputElement) {
        inputElement.style.width = "1000px";
      }
    }
  }, [geocoderRef.current]);

  const {isDesktop} = useScreen();
  const {loginWithRedirect, isAuthenticated, user, logout} = useAuth0();
  const [mintPageVisible, setMintPageVisible] = React.useState(false);
  const [isTOSChecked, setIsTOSChecked] = React.useState(false);
  console.log('isAuthenticated', isAuthenticated);
  console.log('user', user);

  return (
    <CTACardWrapper className={props.className}>
      {!mintPageVisible && !isAuthenticated ? (
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
                href="https://aragon.org/terms-and-conditions"
                style={{color: 'blue', textDecoration: 'underline'}}
              >
                Aragon DAO Participation Agreement.
              </a>
            </label>
          </>
          <ButtonText
            size="large"
            label="Mint NFT"
            disabled={!isTOSChecked || !isAuthenticated}
            onClick={() => {
              if (!isTOSChecked) {
                alert('Please accept the terms and conditions');
                return;
              } else {
                // props.onClick(selectedLocation);
                alert('Minting NFT coming soon!');
              }
            }}
          />
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

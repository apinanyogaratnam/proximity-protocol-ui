import {
  ButtonGroup,
  ButtonText,
  IconChevronDown,
  Option,
  Spinner,
} from '@aragon/ui-components';
import React, {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {createApi} from 'unsplash-js';

import {DaoCard} from 'components/daoCard';
import {useDaos} from 'hooks/useDaos';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';
import {Dashboard} from 'utils/paths';
import {useReactiveVar} from '@apollo/client';
import {favoriteDaosVar} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import secrets from '../../../../../secret.json';
import {useNewWallet} from 'hooks/useNewWallet';
import abi from '../../../../../abi/abi.json';
import {decodeIntToString, getCountryName} from 'utils/idUnified';

const EXPLORE_FILTER = ['favorite', 'newest', 'popular'] as const;

export type ExploreFilter = typeof EXPLORE_FILTER[number];

export function isExploreFilter(
  filterValue: string
): filterValue is ExploreFilter {
  return EXPLORE_FILTER.some(ef => ef === filterValue);
}

const PAGE_SIZE = 4;

export const DaoExplorer = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {address} = useWallet();
  const {network} = useNetwork();

  const favoritedDaos = useReactiveVar(favoriteDaosVar);
  const loggedInAndHasFavoritedDaos =
    address !== null && favoritedDaos.length > 0;

  const [filterValue, setFilterValue] = useState<ExploreFilter>(() =>
    loggedInAndHasFavoritedDaos ? 'favorite' : 'newest'
  );
  const filterRef = useRef(filterValue);

  const [skip, setSkip] = useState(0);
  const {data, isLoading} = useDaos(filterValue, PAGE_SIZE, skip);
  const [displayedDaos, setDisplayedDaos] = useState(data);
  const [daoImages, setDaoImages] = useState([]);
  const {web3, account} = useNewWallet();

  const [initialDaos, setInitialDaos] = useState([
    {
      name: 'Global',
      url: 'https://source.unsplash.com/1600x900/?global',
    },
  ]);

  const getImage = async name => {
    const unsplashQuery = createApi({
      accessKey: secrets.UNSPLASH_ACCESS_KEY,
    });
    const res = await unsplashQuery.search.getPhotos({
      query: name,
      perPage: 1,
    });
    console.log('unsplash response', res);
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${name}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Client-ID ${secrets.UNSPLASH_ACCESS_KEY}`,
        },
      }
    );
    const data = await response.json();
    const formattedData = {
      username: res.response.results[0].user.name,
      image: res.response.results[0].urls.regular,
    };
    console.log('formatted data', formattedData);
    return {
      username: data.results[0].user.username,
      image: data.results[0].urls.regular,
    };
  };

  const getUserNft = async (
    userAddress: string,
    contractAddress: string
  ): Promise<BigInt> => {
    const contract = new web3.eth.Contract(abi, contractAddress);
    const nftId = await contract.methods.nftId(userAddress).call();
    return nftId;
  };

  const appendDaos = async () => {
    console.log('appending daos');
    const nftId = await getUserNft(account, secrets.CONTRACT_ADDRESS);
    console.log('nftId', nftId);
    // const str = decodeIntToString(nftId);
    const countryName = await getCountryName(`country.${nftId}`);
    const isExistingLocation = initialDaos.some(dao => dao.name === countryName);
    if (!isExistingLocation) {
      console.log('querying location append daos', countryName);
      const image = await getImage(countryName);
      setInitialDaos(prev => [...prev, {name: countryName, url: image.image}]);
    }
  };

  useEffect(() => {
    async function fetchImages() {
      const images = [];
      console.log('fetching images');
      for (let i = 0; i < initialDaos.length; i++) {
        const data = await getImage(initialDaos[i].name);
        console.log('response', data);
        images.push(data);
      }
      setDaoImages(images); // <-- update the daoImages state
    }

    if (daoImages.length === 0) {
      fetchImages();
      appendDaos();
    }
    // intentionally leaving filter value out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  // useEffect(() => {
  //   if (data) {
  //     if (filterRef.current !== filterValue) {
  //       setDisplayedDaos(data);
  //       filterRef.current = filterValue;
  //     } else setDisplayedDaos(prev => [...prev, ...data]);
  //   }

  //   // NOTE: somewhere up the chain, changing login state is creating new instance
  //   // of the data from useDaos hook. Patching by doing proper data comparison
  //   // using JSON.stringify. Proper investigation needs to be done
  //   // [FF - 01/16/2023]

  //   // intentionally removing filterValue from the dependencies
  //   // because the update to the ref needs to happen after data
  //   // has changed only
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [JSON.stringify(data[0])]);

  const filterWasChanged = filterRef.current !== filterValue;

  const handleShowMoreClick = () => {
    if (!isLoading) setSkip(prev => prev + PAGE_SIZE);
  };

  const handleFilterChange = (filterValue: string) => {
    if (isExploreFilter(filterValue)) {
      setFilterValue(filterValue);
      setSkip(0);
    } else throw Error(`${filterValue} is not an acceptable filter value`);
    return;
  };

  // const initialDaos = [
  //   'https://source.unsplash.com/1600x900/?global',
  //   'https://source.unsplash.com/1600x900/?toronto',
  //   'https://source.unsplash.com/1600x900/?vancouver',
  // ];

  const DAOS = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          // width: '100%',
          padding: '20px',
          flexWrap: 'wrap',
        }}
      >
        {initialDaos.map((dao, index) => {
          return (
            <div
              key={index}
              style={{
                width: 'calc(50% - 20px)',
                height: '300px',
                backgroundImage: `url(${
                  daoImages[index] && daoImages[index].image
                })`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderRadius: '10px',
                marginRight: '10px',
                marginBottom: '20px',
                cursor: 'pointer',
                marginLeft: index % 2 === 0 ? '0' : '20px',
                position: 'relative', // Add position to allow for absolute positioning of button
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  {dao.name}
                </div>
              </div>

              <div // Add a new div for the button
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  backgroundColor: 'white',
                  color: 'blue',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  borderRadius: '20px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                }}
              >
                View
              </div>

              <div // Add a new div for the photo credit
                style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  color: 'white',
                  fontSize: '12px',
                }}
              >
                Photo by {daoImages[index] && daoImages[index].username}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Container>
      <MainContainer>
        <HeaderWrapper>
          <Title>Explore DAOs</Title>
          {loggedInAndHasFavoritedDaos && (
            <ButtonGroupContainer>
              <ButtonGroup
                defaultValue={filterValue}
                onChange={v => handleFilterChange(v)}
                bgWhite={false}
              >
                <Option label={t('explore.explorer.myDaos')} value="favorite" />

                {/* <Option label={t('explore.explorer.popular')} value="popular" /> */}
                <Option label={t('explore.explorer.newest')} value="newest" />
              </ButtonGroup>
            </ButtonGroupContainer>
          )}
        </HeaderWrapper>
        <DAOS />
        <CardsWrapper>
          {filterWasChanged && isLoading ? (
            <Spinner size="default" />
          ) : (
            displayedDaos.map((dao, index) => (
              <DaoCard
                name={dao.metadata.name}
                ensName={dao.ensDomain}
                logo={dao.metadata.avatar}
                description={dao.metadata.description}
                chainId={dao.chain || CHAIN_METADATA[network].id} // Default to Goerli
                daoType={
                  (dao?.plugins?.[0]?.id as PluginTypes) ===
                  'token-voting.plugin.dao.eth'
                    ? 'token-based'
                    : 'wallet-based'
                }
                key={index}
                onClick={() =>
                  navigate(
                    generatePath(Dashboard, {
                      network: getSupportedNetworkByChainId(
                        dao.chain || CHAIN_METADATA[network].id
                      ),
                      dao: dao.address,
                    })
                  )
                }
              />
            ))
          )}
        </CardsWrapper>
      </MainContainer>
      {data.length >= PAGE_SIZE && !filterWasChanged && (
        <div>
          <ButtonText
            label={t('explore.explorer.showMore')}
            iconRight={isLoading ? <Spinner size="xs" /> : <IconChevronDown />}
            bgWhite
            mode="ghost"
            onClick={handleShowMoreClick}
          />
        </div>
      )}
    </Container>
  );
};

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex',
})``;

const MainContainer = styled.div.attrs({
  className: 'flex flex-col space-y-2 desktop:space-y-3',
})``;
const Container = styled.div.attrs({
  className: 'flex flex-col space-y-1.5',
})``;
const HeaderWrapper = styled.div.attrs({
  className:
    'flex flex-col space-y-2 desktop:flex-row desktop:space-y-0 desktop:justify-between',
})``;
const CardsWrapper = styled.div.attrs({
  className: 'grid grid-cols-1 gap-1.5 desktop:grid-cols-2 desktop:gap-3',
})``;
const Title = styled.p.attrs({
  className: 'font-bold ft-text-xl text-ui-800',
})``;

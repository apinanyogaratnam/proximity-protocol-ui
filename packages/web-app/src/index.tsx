import {ApolloProvider} from '@apollo/client';
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';
import {UseSignerProvider} from 'context/signer';
import 'tailwindcss/tailwind.css';
import {IProviderOptions} from 'web3modal';
import {loadConnectKit} from '@ledgerhq/connect-kit-loader';
import {
  Context,
  ContextParams,
  Client,
  ContextPlugin,
} from '@aragon/sdk-client';

import {ethers} from 'ethers';
import {AlertProvider} from 'context/alert';
import {client, goerliClient} from 'context/apolloClient';
import {APMProvider} from 'context/elasticAPM';
import {GlobalModalsProvider} from 'context/globalModals';
import {NetworkProvider} from 'context/network';
import {PrivacyContextProvider} from 'context/privacyContext';
import {ProvidersProvider} from 'context/providers';
import {TransactionDetailProvider} from 'context/transactionDetail';
import {WalletMenuProvider} from 'context/walletMenu';
import {UseCacheProvider} from 'hooks/useCache';
import {UseClientProvider} from 'hooks/useClient';
import {infuraApiKey} from 'utils/constants';
import App from './app';
import {Auth0Provider} from '@auth0/auth0-react';
import secret from '../../../secret.json';
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const contextParams: ContextParams = {
  // Choose the network you want to use. You can use "goerli" or "mumbai" for testing, "mainnet" for Ethereum.
  network: 'goerli',
  // Depending on how you're configuring your wallet, you may want to pass in a `signer` object here.
  signer: signer,
  pluginRepoRegistryAddress: '0x970Eb7Dd57c9F0dc4c5a10c06653d1103946b508',
  // Pass the address of the  `DaoFactory` contract you want to use. You can find it here based on your chain of choice: https://github.com/aragon/core/blob/develop/active_contracts.json
  daoFactoryAddress: '0x16B6c6674fEf5d29C9a49EA68A19944f5a8471D3',
  // Choose your Web3 provider: Cloudfare, Infura, Alchemy, etc.
  web3Providers: ['https://rpc.ankr.com/eth_goerli'],
  //todo add a real IPFS node
  ipfsNodes: [
    {
      url: 'https://testing-ipfs-0.aragon.network/api/v0',
      headers: {'X-API-KEY': ''},
    },
  ],
  // Don't change this line. This is how we connect your app to the Aragon subgraph.
  graphqlNodes: [
    {
      url: 'https://subgraph.satsuma-prod.com/aragon/core-goerli/api',
    },
  ],
};

const context: Context = new Context(contextParams);

export const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
console.log('contextPlugin:', contextPlugin);

export const aragonClient: Client = new Client(context);
console.log('client', {aragonClient});

const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: infuraApiKey,
    },
  },
  ledger: {
    package: loadConnectKit, // required
    options: {
      infuraId: infuraApiKey,
    },
  },
};

const CACHE_VERSION = 1;
const onLoad = () => {
  // Wipe local storage cache if its structure is out of date and clashes
  // with this version of the app.
  const cacheVersion = localStorage.getItem('AragonCacheVersion');
  const retainKeys = ['privacy-policy-preferences', 'favoriteDaos'];
  if (!cacheVersion || parseInt(cacheVersion) < CACHE_VERSION) {
    for (let i = 0; i < localStorage.length; i++) {
      if (!retainKeys.includes(localStorage.key(i)!)) {
        localStorage.removeItem(localStorage.key(i)!);
      }
    }
    localStorage.setItem('AragonCacheVersion', CACHE_VERSION.toString());
  }
};
onLoad();

ReactDOM.render(
  <React.StrictMode>
    <PrivacyContextProvider>
      <APMProvider>
        <Router>
          <AlertProvider>
            <UseSignerProvider providerOptions={providerOptions}>
              <NetworkProvider>
                <UseClientProvider>
                  <UseCacheProvider>
                    <ProvidersProvider>
                      <TransactionDetailProvider>
                        <WalletMenuProvider>
                          <GlobalModalsProvider>
                            {/* By default, goerli client is chosen, each useQuery needs to pass the network client it needs as argument
                      For REST queries using apollo, there's no need to pass a different client to useQuery  */}
                            <ApolloProvider
                              client={client['goerli'] || goerliClient} //TODO remove fallback when all clients are defined
                            >
                              <Auth0Provider
                                domain="dev-pydmztrrjhsxf7fv.us.auth0.com"
                                clientId={secret.AUTH0_CLIENT_ID}
                                authorizationParams={{
                                  redirect_uri: window.location.origin,
                                }}
                              >
                                <App />
                              </Auth0Provider>
                            </ApolloProvider>
                          </GlobalModalsProvider>
                        </WalletMenuProvider>
                      </TransactionDetailProvider>
                    </ProvidersProvider>
                  </UseCacheProvider>
                </UseClientProvider>
              </NetworkProvider>
            </UseSignerProvider>
          </AlertProvider>
        </Router>
      </APMProvider>
    </PrivacyContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

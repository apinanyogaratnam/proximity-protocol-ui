import {
  Client,
  CreateDaoParams,
  DaoCreationSteps,
  DaoMetadata,
  GasFeeEstimation,
  ITokenVotingPluginInstall,
  TokenVotingClient,
  VotingMode,
} from '@aragon/sdk-client';

import {aragonClient} from 'index';

async function createDao(
  tokenName: string,
  tokenSymbol: string,
  websiteUrl: string,
  description: string,
  minDuration: any,
  minParticipation: any,
  supportThreshold: any,
  minProposerVotingPower: any,
  mintingAddress: string,
  avatarUrl?: string
) {
  const daoMetadata: DaoMetadata = {
    name: tokenName,
    description: description,
    avatar: avatarUrl,
    links: [
      {
        name: 'Web site',
        url: websiteUrl,
      },
    ],
  };

  const metadataUri = await aragonClient.methods.pinMetadata(daoMetadata);

  //todo make type for our plugin
  const pluginInitParams: any = {
    votingSettings: {
      minDuration: minDuration,
      minParticipation: minParticipation,
      supportThreshold: supportThreshold,
      minProposerVotingPower: minProposerVotingPower,
      votingMode: VotingMode.STANDARD,
    },
    newToken: {
      name: tokenName, // the name of your token
      symbol: tokenSymbol, // the symbol for your token. shouldn't be more than 5 letters
      decimals: 18, // the number of decimals your token uses
      // minter: "0x...", // optional. if you don't define any, we'll use the standard OZ ERC20 contract. Otherwise, you can define your own token minter contract address.
      balances: [
        {
          // todo Defines the initial balances of the new token
          address: mintingAddress, // address of the account to receive the newly minted tokens
          balance: BigInt(10), // amount of tokens that address should receive
        },
      ],
    },
  };
}

import {useEffect, useState} from 'react';
import Web3 from 'web3';
import secrets from '../../../../secret.json';

export const useNewWallet = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [error, setError] = useState<unknown | null>(null);

  const connectWallet = async () => {
    let web3;
    try {
      if (
        typeof window !== 'undefined' &&
        typeof window.ethereum !== 'undefined'
      ) {
        // await window.ethereum.enable();
        web3 = new Web3(window.ethereum);
        setWeb3(web3);
      } else {
        // check if the user has metamask installed
        alert('Please install Metamask');
        return;
      }

      const accounts = await web3.eth.getAccounts();
      console.log('use new wallet getting accounts', accounts);
      setAccount(accounts[0]);
      setWeb3(web3);
      const balance = await web3.eth.getBalance(accounts[0]);
      setBalance(balance);
      const networkId = await web3.eth.net.getId();
      setNetworkId(networkId);
      const network = await web3.eth.net.getNetworkType();
      setNetwork(network);
    } catch (error) {
      setError(error);
    }
  };

  useEffect(async () => {
    await connectWallet();
  }, []);

  return {web3, account, balance, network, networkId, error};
};

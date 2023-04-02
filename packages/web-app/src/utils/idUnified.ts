import axios from 'axios';
import secrets from '../../../../secret.json';

export const encodeStringToInt = (str: string): BigInt => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let num = BigInt(0);
  bytes.forEach((byte, i) => {
    num += BigInt(byte) << BigInt(8 * i);
  });
  console.log('encoded', str, 'to', num);
  return num;
};

export const decodeIntToString = (num: BigInt): string => {
  const byteArray = [];
  while (num > 0) {
    const byte = Number(num & BigInt(0xff));
    byteArray.push(byte);
    num >>= BigInt(8);
  }
  const decoder = new TextDecoder();
  const text = decoder.decode(new Uint8Array(byteArray));
  console.log('decoded', num, 'to', text);
  return text;
};

export const getCountryName = async (countryId) => {
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${countryId}.json`,
      {
        params: {
          access_token: secrets.MAPBOX_API_KEY,
        },
      }
    );

    const countryFeature = response.data.features.find(
      (feature) => feature.id.startsWith('country.')
    );

    if (countryFeature) {
      return countryFeature.text;
    } else {
      console.log('No country found with this ID:', countryId);
      return null;
    }
  } catch (error) {
    console.error('Error fetching country name:', error);
    return null;
  }
};

import { useLocalSearchParams } from 'expo-router';

import { TokenScreen } from '@/features/token/TokenScreen';
import { parseNetworkId } from '@/utils/token';

export default function TokenRoute() {
  const { address, networkId: networkIdParam } = useLocalSearchParams<{
    address: string;
    networkId: string;
  }>();

  return (
    <TokenScreen
      address={address ?? ''}
      networkId={parseNetworkId(networkIdParam)}
    />
  );
}

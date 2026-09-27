import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';

import { SwapScreen } from '@/features/swap/SwapScreen';
import { useSwapUi } from '@/features/swap/swapUi';

export default function SwapRoute() {
  useFocusEffect(
    useCallback(() => {
      return () => {
        useSwapUi.getState().reset();
      };
    }, [])
  );

  return <SwapScreen />;
}

import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokenFromPath } from '@/components/OpenSwapButton/tokenFromPath';
import { useSwapUi } from '@/features/swap/swapUi';
import { ThemedText } from '@/ui/ThemedText';
import { Spacing } from '@/ui/theme';
import { useTheme } from '@/ui/useTheme';

const strings = {
  swapThisToken: 'Swap this token',
  openSwap: 'Open swap',
  swap: 'Swap',
};

/**
 * Floating swap button that appears in the bottom right of the screen.
 *
 * If a token is provided in the path, it will prefill the input token.
 * Otherwise it will open the swap screen with no prefilled tokens.
 *
 * @returns Button to open the swap screen
 */
export function OpenSwapButton() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const token = tokenFromPath(pathname);

  if (pathname === '/swap') {
    return null;
  }

  function openSwap() {
    if (token) {
      useSwapUi.getState().prefillInput(token);
    } else {
      useSwapUi.getState().reset();
    }
    router.push('/swap');
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={token ? strings.swapThisToken : strings.openSwap}
      onPress={openSwap}
      style={[
        styles.button,
        {
          backgroundColor: theme.backgroundElement,
          bottom: insets.bottom + Spacing.three,
        },
      ]}
    >
      <ThemedText type="smallBold">{strings.swap}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: Spacing.four,
    zIndex: 20,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
});

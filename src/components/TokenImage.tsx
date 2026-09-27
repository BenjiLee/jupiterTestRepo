import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { UNKNOWN_SYMBOL } from '@/domain/tokens';
import { ThemedText } from '@/ui/ThemedText';
import { useTheme } from '@/ui/useTheme';

type TokenImageProps = {
  uri?: string;
  symbol?: string;
  size?: number;
};

/**
 * Renders an image of the input token's uri. Otherwise falls back
 * to the symbol.
 */
export function TokenImage({
  uri,
  symbol = UNKNOWN_SYMBOL,
  size = 36,
}: TokenImageProps) {
  const theme = useTheme();
  const [failedUri, setFailedUri] = useState<string | undefined>();
  const showImage = Boolean(uri) && failedUri !== uri;

  return (
    <View
      style={[
        styles.frame,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.backgroundSelected,
        },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
          recyclingKey={uri}
          onError={() => setFailedUri(uri)}
          accessibilityLabel={symbol}
        />
      ) : (
        <ThemedText
          type="smallBold"
          style={{ fontSize: Math.max(10, size * 0.28) }}
        >
          {symbol.slice(0, 4)}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'rn-vs-lb/theme';


type DashboardHeaderProps = {
  onPressFilters?: () => void;
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onPressFilters }) => {
  const { theme, typography, sizes } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: sizes.xs as number,
        },
        logo: {
          letterSpacing: 1,
          fontWeight: '700',
          fontSize: 24,
          color: theme.title,
        },
        button: {
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.card,
        },
        subtitle: {
          ...typography.bodySm,
          color: theme.greyText,
        },
        left: {
          gap: sizes.xs as number,
        },
      }),
    [theme, typography, sizes],
  );

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.logo}>AiAstrology</Text>
        <Text style={styles.subtitle}>Гороскоп на каждый день</Text>
      </View>
      {/* <Pressable
        onPress={onPressFilters}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Открыть фильтры"
        hitSlop={8}
      >
        <Feather name="sliders" size={20} color={theme.title} />
      </Pressable> */}
    </View>
  );
};
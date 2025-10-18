import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { usePortalNavigation } from '../../helpers/hooks';
import { useTheme } from 'rn-vs-lb/theme';

type Props = {
  accepted: boolean;
  onToggle: () => void;
  showError?: boolean;
  color?: string;
};

export const TermsCheckbox: React.FC<Props> = ({
  accepted,
  onToggle,
  showError,
  color
}) => {
  const { goToTermOfUse } = usePortalNavigation();
  const { theme, formStyles, typography } = useTheme();

  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={onToggle}
          style={[
            styles.checkbox,
            { borderColor: accepted ? color : theme.border, backgroundColor: accepted ? color : '#fff' },
          ]}
        >
          {accepted && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <Text style={typography.body}>
          I agree to the{' '}
          <Text style={[styles.link, { color }]} onPress={goToTermOfUse}>
            Terms of Use
          </Text>
        </Text>
      </View>
      {showError && (
        <Text style={formStyles.errorText}>You must accept the Terms of Use to continue</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  link: {
    textDecorationLine: 'underline',
  },
});

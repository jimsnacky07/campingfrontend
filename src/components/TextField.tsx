import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { COLORS, RADIUS } from '../constants/Theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: any;
}

const TextField: React.FC<Props> = ({ label, error, containerStyle, ...rest }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        {...rest}
        style={[styles.input, error && styles.inputError, rest.multiline && styles.multiline]}
        placeholderTextColor={COLORS.textSecondary}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  error: {
    color: COLORS.error,
    marginTop: 4,
    fontSize: 12,
  },
});

export default TextField;



import React from 'react';
import { Text, type TextStyle } from 'react-native';

export const renderBoldText = (
  value: string,
  boldStyle: TextStyle,
  keyPrefix = 'bold',
): React.ReactNode[] => {
  if (!value) {
    return [''];
  }

  const segments: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    if (match.index > lastIndex) {
      segments.push(value.slice(lastIndex, match.index));
    }

    segments.push(
      <Text key={`${keyPrefix}-${match.index}`} style={boldStyle}>
        {match[1]}
      </Text>,
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    segments.push(value.slice(lastIndex));
  }

  return segments.length ? segments : [value];
};

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors, padding, texts } from '../../styles';

type Props = {
  weekDay: string;
  day: string;
  selected: boolean;
  onSelect: () => void;
};

export const DayBoxListItem = ({ weekDay, day, selected, onSelect }: Props) => {
  return (
    <TouchableOpacity onPress={onSelect}>
      <View
        style={{
          height: 64,
          width: 64,
          padding,
          backgroundColor: selected ? colors.green100 : colors.white,
          borderWidth: 1,
          borderColor: selected ? colors.green100 : colors.grey500,
        }}
      >
        <Text style={{ ...texts.xs, color: colors.grey700 }}>{weekDay}</Text>
        <Text style={{ ...texts.x2l, color: colors.black }}>{day}</Text>
      </View>
    </TouchableOpacity>
  );
};

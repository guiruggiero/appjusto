import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../common/styles';

type Props = {
  onPress: () => void;
};

export const MessagesIcon = ({ onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          height: 20,
          width: 20,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 10,
          backgroundColor: colors.red,
          // top: -8,
          top: -6,
          left: 12,
          position: 'absolute',
        }}
      >
        <Text style={{ color: colors.white }}>4</Text>
      </View>
      <View>
        <View>
          <Feather name="message-circle" size={28} color={colors.black} />
        </View>
      </View>
    </TouchableOpacity>
  );
};
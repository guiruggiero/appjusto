import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import ArrowBox from '../../../../../common/components/views/ArrowBox';
import { borders, colors, padding, texts } from '../../../../../common/styles';
import { formatCurrency } from '../../../../../common/utils/formatters';
import { t } from '../../../../../strings';

type Props = {
  name: string;
  participants: number | undefined;
  description: string;
  minimumFee: number;
  feePerKm: number;
  onPress: () => void;
};

export default function ({
  name,
  participants,
  description,
  minimumFee,
  feePerKm,
  onPress,
}: Props) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          justifyContent: 'space-between',
          width: '100%',
          paddingHorizontal: padding,
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            alignItems: 'flex-start',
            flex: 1,
          }}
        >
          <Text style={{ ...texts.sm }}>{name}</Text>
          <Text style={{ ...texts.xs, marginTop: 4, color: colors.green600 }}>
            {participants} {t('participantes online')}
          </Text>
          <Text
            style={{
              ...texts.xs,
              marginTop: 8,
              color: colors.grey700,
            }}
          >
            {description}
          </Text>
          <View
            style={{
              ...borders.default,
              borderColor: colors.black,
              backgroundColor: colors.white,
              borderRadius: 32,
              paddingVertical: 4,
              paddingHorizontal: 8,
              marginTop: 8,
            }}
          >
            <Text>{`${t('Mínimo de')} ${formatCurrency(minimumFee)} + ${formatCurrency(
              feePerKm
            )}`}</Text>
          </View>
        </View>
        <ArrowBox />
      </View>
      <View
        style={{
          borderColor: colors.grey500,
          borderStyle: 'solid',
          borderWidth: 1,
          marginVertical: padding,
          width: '100%',
        }}
      />
    </TouchableOpacity>
  );
}

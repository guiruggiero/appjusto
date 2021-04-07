import React from 'react';
import { Text, View } from 'react-native';
import { t } from '../../../strings';
import { colors, texts } from '../../styles';
import Pill from '../views/Pill';

type Props = {
  title: string;
  subtitle: string;
  secondary?: boolean;
};

export default function ({ title, subtitle, secondary, ...props }: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, flex: 1 }} {...props}>
      <Pill tall color={secondary ? colors.grey700 : colors.green500} />
      <View style={{ marginLeft: 12 }}>
        <Text style={{ ...texts.xl, color: secondary ? colors.grey700 : colors.black }}>
          {t(title)}
        </Text>
        <Text style={{ ...texts.xs, color: secondary ? colors.grey700 : colors.grey700 }}>
          {t(subtitle)}
        </Text>
      </View>
    </View>
  );
}

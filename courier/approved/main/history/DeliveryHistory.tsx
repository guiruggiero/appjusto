import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Constants from 'expo-constants';
import React, { useMemo } from 'react';
import { Image, SectionList, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as icons from '../../../../assets/icons';
import PaddedView from '../../../../common/components/containers/PaddedView';
import RoundedText from '../../../../common/components/texts/RoundedText';
import ConfigItem from '../../../../common/components/views/ConfigItem';
import FeedbackView from '../../../../common/components/views/FeedbackView';
import ShowIf from '../../../../common/components/views/ShowIf';
import { IconMotocycle } from '../../../../common/icons/icon-motocycle';
import useObserveOrders from '../../../../common/store/api/order/hooks/useObserveOrders';
import {
  getMonthsWithOrdersInYear,
  getOrdersWithFilter,
  getYearsWithOrders,
  summarizeOrders,
} from '../../../../common/store/order/selectors';
import { getUser } from '../../../../common/store/user/selectors';
import { colors, halfPadding, padding, screens, texts } from '../../../../common/styles';
import { formatCurrency, getMonthName } from '../../../../common/utils/formatters';
import { t } from '../../../../strings';
import { DeliveriesNavigatorParamList } from './types';

type ScreenNavigationProp = StackNavigationProp<DeliveriesNavigatorParamList, 'DeliveryHistory'>;
type ScreenRoute = RouteProp<DeliveriesNavigatorParamList, 'DeliveryHistory'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRoute;
};

export default function ({ navigation, route }: Props) {
  // app state
  const user = useSelector(getUser);
  // screen state
  const options = React.useMemo(() => ({ courierId: user?.uid }), [user?.uid]);
  const orders = useObserveOrders(options);
  const yearsWithOrders = getYearsWithOrders(orders);
  const monthsWithOrdersInYears = getMonthsWithOrdersInYear(orders);

  // screen state
  // data structure
  // [ { title: '2020', data: [ { monthName: 'Agosto', deliveries: 3, courierFee: 100 }] }]
  const sections = useMemo(() => {
    return yearsWithOrders.map((year) => {
      const monthsInYear = monthsWithOrdersInYears(year);

      return {
        title: String(year),
        data: monthsInYear.map((month) => ({
          key: `${year}-${month}`,
          year,
          month,
          ...summarizeOrders(getOrdersWithFilter(orders, year, month)),
        })),
      };
    });
  }, [yearsWithOrders]);

  // UI
  const paddingTop = Constants.statusBarHeight;
  if (sections.length === 0) {
    return (
      <FeedbackView
        header={t('Seu histórico está vazio')}
        description={t('Você ainda não fez nenhuma corrida')}
        icon={<IconMotocycle />}
        background={colors.grey50}
      />
    );
  }

  return (
    <View style={{ ...screens.config }}>
      <SectionList
        style={{ flex: 1, paddingTop }}
        sections={sections}
        keyExtractor={(item) => item.key}
        renderSectionHeader={({ section }) => (
          <PaddedView
            style={{
              flexDirection: 'row',
              borderBottomColor: colors.grey500,
              borderBottomWidth: 1,
            }}
          >
            <Image source={icons.calendar} />
            <Text style={{ ...texts.md, marginLeft: padding }}>{section.title}</Text>
          </PaddedView>
        )}
        renderItem={({ item }) => {
          const title = getMonthName(item.month);
          const subtitle =
            item.delivered +
            t(' corridas finalizadas') +
            '\n' +
            t('Total recebido: ') +
            formatCurrency(item.courierFee);
          return (
            <ConfigItem
              title={title}
              subtitle={subtitle}
              onPress={() =>
                navigation.navigate('DeliveryHistoryByMonth', {
                  year: item.year,
                  month: item.month,
                })
              }
            >
              <ShowIf test={item.ongoing > 0}>
                {() => (
                  <View style={{ marginTop: halfPadding }}>
                    <RoundedText backgroundColor={colors.yellow}>
                      {t('Corrida em andamento')}
                    </RoundedText>
                  </View>
                )}
              </ShowIf>
            </ConfigItem>
          );
        }}
      />
    </View>
  );
}

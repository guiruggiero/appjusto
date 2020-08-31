import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useCallback, useContext } from 'react';
import { Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import * as icons from '../../../assets/icons';
import useNotification from '../../../hooks/useNotification';
import { getCourier } from '../../../store/courier/selectors';
import { CourierStatus } from '../../../store/courier/types';
import { observeOrdersDeliveredBy } from '../../../store/order/actions';
import { getOngoingOrders } from '../../../store/order/selectors';
import { OrderMatchRequest } from '../../../store/order/types';
import { getUser } from '../../../store/user/selectors';
import { t } from '../../../strings';
import { ApiContext, AppDispatch } from '../../app/context';
import BackButton from '../../common/buttons/BackButton';
import { colors } from '../../common/styles';
import ProfileNavigator from '../../profile/ProfileNavigator';
import DeliveriesNavigator from './history/DeliveriesNavigator';
import HomeNavigator from './home/HomeNavigator';
import Matching from './matching/Matching';
import MatchingFeedback from './matching/MatchingFeedback';
import { MainParamList, ApprovedParamList } from './types';

type ScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ApprovedParamList, 'Main'>,
  BottomTabNavigationProp<MainParamList>
>;

type Props = {
  navigation: ScreenNavigationProp;
};

const MainNavigator = createBottomTabNavigator<MainParamList>();
function Main({ navigation }: Props) {
  // context
  const api = useContext(ApiContext);
  const dispatch = useDispatch<AppDispatch>();

  // app state
  const courier = useSelector(getCourier);
  const ongoingOrders = useSelector(getOngoingOrders);

  // effects
  // subscribe for order changes
  useEffect(() => {
    return dispatch(observeOrdersDeliveredBy(api)(courier!.id!));
  }, []);

  // when a courier accept the order
  useEffect(() => {
    // as the courier can only dispatch a single order at a time ongoingOrders should be 0 or 1
    if (ongoingOrders.length > 0) {
      console.log('ongoinOrders');
      const [order] = ongoingOrders;
      navigation.navigate('Deliveries', {
        screen: 'OngoingOrder',
        params: { orderId: order.id },
      });
    }
  }, [ongoingOrders]);

  // handlers
  const notificationHandler = useCallback(
    (content: Notifications.NotificationContent) => {
      if (content.data.action === 'matching') {
        console.log(courier?.status);
        // should always be true as couriers should receive matching notifications only when they're available
        if (courier!.status === CourierStatus.Available) {
          navigation.navigate('Matching', {
            matchRequest: (content.data as unknown) as OrderMatchRequest,
          });
        }
      }
    },
    [navigation]
  );
  useNotification(notificationHandler);

  // test only
  // useEffect(() => {
  //   setTimeout(() => {
  //     navigation.navigate('Matching', {
  //       matchRequest: {
  //         orderId: '12',
  //         courierFee: '10',
  //         originAddress: 'Shopping Iguatemi - Edson Queiroz, Fortaleza - CE, 60810-350, Brasil',
  //         destinationAddress:
  //           'Rua Canuto de Aguiar, 500 - Meireles, Fortaleza - CE, 60160-120, Brasil',
  //         distanceToOrigin: 2,
  //         totalDistance: 10,
  //       },
  //     });
  //   }, 50);
  // }, []);

  return (
    <MainNavigator.Navigator
      tabBarOptions={{
        activeTintColor: colors.black,
        inactiveTintColor: colors.black,
        activeBackgroundColor: colors.green,
        inactiveBackgroundColor: colors.white,
      }}
    >
      <MainNavigator.Screen
        name="Home"
        component={HomeNavigator}
        options={{ title: t('Início'), tabBarIcon: () => <Image source={icons.home} /> }}
      />
      <MainNavigator.Screen
        name="Deliveries"
        component={DeliveriesNavigator}
        options={{ title: t('Suas corridas'), tabBarIcon: () => <Image source={icons.orders} /> }}
      />
      <MainNavigator.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ title: t('Sua conta'), tabBarIcon: () => <Image source={icons.user} /> }}
      />
    </MainNavigator.Navigator>
  );
}

const ApprovedNavigator = createStackNavigator<ApprovedParamList>();
export default function () {
  return (
    <ApprovedNavigator.Navigator mode="modal">
      <ApprovedNavigator.Screen name="Main" component={Main} options={{ headerShown: false }} />
      <ApprovedNavigator.Screen
        name="Matching"
        component={Matching}
        options={({ navigation }) => ({
          title: t('Nova corrida'),
          headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        })}
      />
      <ApprovedNavigator.Screen
        name="MatchingFeedback"
        component={MatchingFeedback}
        options={{ headerShown: false }}
      />
    </ApprovedNavigator.Navigator>
  );
}

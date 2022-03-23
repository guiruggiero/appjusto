import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Image, TouchableWithoutFeedback, View } from 'react-native';
import { headerMenu } from '../assets/icons';
import { defaultScreenOptions } from '../common/screens/options';
import { AboutApp } from '../common/screens/profile/AboutApp';
import Terms from '../common/screens/unlogged/Terms';
import { t } from '../strings';
import { BusinessOrders } from './orders/screens/BusinessOrders';
import { ManagerOptions } from './orders/screens/ManagerOptions';
import { OrderDetail } from './orders/screens/OrderDetail';
import { BusinessNavParamsList } from './types';

const Stack = createStackNavigator<BusinessNavParamsList>();

export const BusinessNavigator = () => {
  // UI
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      <Stack.Screen
        name="BusinessOrders"
        component={BusinessOrders}
        options={({ navigation, route }) => ({
          title: t('Gerenciador de pedidos'),
          headerLeft: () => (
            <TouchableWithoutFeedback onPress={() => navigation.navigate('ManagerOptions')}>
              <View style={{ marginLeft: 12 }}>
                <Image source={headerMenu} height={32} width={32} />
              </View>
            </TouchableWithoutFeedback>
          ),
        })}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetail}
        options={{ title: t('Ver pedido') }}
      />
      <Stack.Screen
        name="ManagerOptions"
        component={ManagerOptions}
        options={{ title: t('Menu') }}
      />
      <Stack.Screen
        name="AboutApp"
        component={AboutApp}
        options={{ title: t('Sobre o AppJusto') }}
      />
      <Stack.Screen name="Terms" component={Terms} options={{ title: t('Fique por dentro') }} />
    </Stack.Navigator>
  );
};
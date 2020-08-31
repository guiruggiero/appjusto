import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import Home from './Home';
import PermissionDeniedFeedback from './PermissionDeniedFeedback';
import { HomeParamList } from './types';

const Stack = createStackNavigator<HomeParamList>();
export default function () {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="PermissionDeniedFeedback" component={PermissionDeniedFeedback} />
    </Stack.Navigator>
  );
}

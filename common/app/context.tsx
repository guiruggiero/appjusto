import { NavigationContainer } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import React, { ReactNode } from 'react';
import { Platform, ToastAndroid, UIManager } from 'react-native';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import Toast from '../components/views/Toast';
import { createStore } from '../store';
import Api from '../store/api/api';
import { getExtra } from '../utils/config';
import { defineLocationUpdatesTask } from '../utils/location';
import * as analytics from './analytics';

const extra = getExtra();
const api = new Api(extra);
const store = createStore(extra);
const queryClient = new QueryClient();

defineLocationUpdatesTask(store, api);
analytics.init(extra.analytics);

export const ApiContext = React.createContext<Api>(api);
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export interface Props {
  children: ReactNode;
}

export const AppContext = ({ children }: Props) => {
  const path = extra.flavor;
  const linking = {
    prefixes: [Linking.makeUrl(path), `https://deeplink.appjusto.com.br`],
  };

  // https://reactnative.dev/docs/layoutanimation.html
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  // debug only
  if (Platform.OS === 'android') {
    ToastAndroid.show(Constants.manifest.revisionId ?? '', ToastAndroid.LONG);
  }

  // UI
  return (
    <ApiContext.Provider value={api}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer linking={linking}>
            {children}
            <Toast />
          </NavigationContainer>
        </QueryClientProvider>
      </Provider>
    </ApiContext.Provider>
  );
};

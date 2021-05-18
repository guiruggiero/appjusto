import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { Image } from 'react-native';
import * as Sentry from 'sentry-expo';
import * as icons from '../../../assets/icons';
import { ApiContext } from '../../../common/app/context';
import DefaultButton from '../../../common/components/buttons/DefaultButton';
import FeedbackView from '../../../common/components/views/FeedbackView';
import { borders, colors, padding } from '../../../common/styles';
import { t } from '../../../strings';
import { LoggedNavigatorParamList } from '../types';
import { OngoingOrderNavigatorParamList } from './types';

type ScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<OngoingOrderNavigatorParamList, 'OngoingOrderNoMatch'>,
  StackNavigationProp<LoggedNavigatorParamList>
>;
type ScreenRouteProp = RouteProp<OngoingOrderNavigatorParamList, 'OngoingOrderNoMatch'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export const OrderNoMatch = ({ navigation, route }: Props) => {
  // context
  const api = React.useContext(ApiContext);
  // params
  const { orderId } = route.params ?? {};
  // state
  const [isLoading, setLoading] = React.useState(false);
  // handlers
  const tryAgainHandler = async () => {
    try {
      setLoading(true);
      await api.order().updateOrder(orderId, { dispatchingStatus: 'matching' });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(
        'Error while trying to update order.dispatchingStatus from no-match to matching again'
      );
      Sentry.Native.captureException(error);
    }
  };
  // UI
  return (
    <FeedbackView
      header={t('Sem entregadores na região :(')}
      description={t(
        'Infelizmente não encontramos nenhum entregador disponível. Tente novamente mais tarde.'
      )}
      icon={<Image source={icons.coneYellow} />}
    >
      <DefaultButton
        title={t('Tentar novamente')}
        onPress={tryAgainHandler}
        activityIndicator={isLoading}
        disabled={isLoading}
        style={{
          ...borders.default,
          marginBottom: padding,
          borderColor: colors.black,
          backgroundColor: 'white',
        }}
      />
      <DefaultButton
        title={t('Voltar para o início')}
        onPress={() => navigation.replace('MainNavigator', { screen: 'Home' })}
      />
    </FeedbackView>
  );
};

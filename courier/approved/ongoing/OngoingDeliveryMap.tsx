import { ChatMessageUser, Order, WithId } from '@appjusto/types';
import React from 'react';
import { View } from 'react-native';
import ShowIf from '../../../common/components/views/ShowIf';
import { StatusAndMessages } from '../../../common/screens/orders/ongoing/StatusAndMessages';
import OrderMap from '../../../common/screens/orders/OrderMap';
import { RouteIcons } from './RouteIcons';

type Props = {
  order: WithId<Order>;
  onOpenChat: (from: ChatMessageUser) => void;
  isLoading: boolean;
};

export const OngoingDeliveryMap = ({ order, onOpenChat, isLoading }: Props) => {
  return order.dispatchingState === 'arrived-destination' ? null : (
    <View>
      <OrderMap order={order!} ratio={1} />
      <ShowIf test={!isLoading}>{() => <RouteIcons order={order} />}</ShowIf>
      <View>
        <StatusAndMessages order={order} onPress={onOpenChat} />
      </View>
    </View>
  );
};

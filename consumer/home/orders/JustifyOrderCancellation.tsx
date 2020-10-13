import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { OrderCancellationReason, WithId } from 'appjusto-types';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';

import * as icons from '../../../assets/icons';
import { ApiContext, AppDispatch } from '../../../common/app/context';
import DefaultButton from '../../../common/components/buttons/DefaultButton';
import PaddedView from '../../../common/components/containers/PaddedView';
import { fetchCancellationReasons, cancelOrder } from '../../../common/store/order/actions';
import { showToast } from '../../../common/store/ui/actions';
import { getUIBusy } from '../../../common/store/ui/selectors';
import { borders, colors, screens, texts } from '../../../common/styles';
import { t } from '../../../strings';
import { HomeNavigatorParamList } from '../types';

type ScreenNavigationProp = StackNavigationProp<HomeNavigatorParamList, 'JustifyOrderCancellation'>;
type ScreenRouteProp = RouteProp<HomeNavigatorParamList, 'JustifyOrderCancellation'>;

type Props = {
  route: ScreenRouteProp;
  navigation: ScreenNavigationProp;
};

export default function ({ route, navigation }: Props) {
  // context
  const api = useContext(ApiContext);
  const dispatch = useDispatch<AppDispatch>();
  const { orderId } = route.params;

  // app state
  const busy = useSelector(getUIBusy);

  // state
  const [reasons, setReasons] = useState<WithId<OrderCancellationReason>[]>([]);
  const [selectedReason, setSelectedReason] = useState<WithId<OrderCancellationReason>>();
  const [rejectionComment, setRejectionComment] = useState<string>('');

  // side effects
  // once
  useEffect(() => {
    (async () => {
      try {
        setReasons(await dispatch(fetchCancellationReasons(api)));
      } catch (error) {
        dispatch(showToast(t('Não foi possível carregar os dados.')));
      }
    })();
  }, []);

  // handlers
  const cancelHandler = useCallback(() => {
    (async () => {
      try {
        await dispatch(
          cancelOrder(api)(orderId, {
            reason: selectedReason!,
            comment: rejectionComment,
          })
        );
        navigation.popToTop();
      } catch (error) {
        dispatch(showToast(t('Não foi possível enviar o comentário')));
      }
    })();
  }, [selectedReason, rejectionComment]);

  // UI
  return (
    <PaddedView style={{ ...screens.configScreen }}>
      <Text style={{ ...texts.big, marginBottom: 24 }}>
        {t('Por que você está cancelando o pedido?')}
      </Text>
      {reasons.map((reason) => (
        <TouchableOpacity key={reason.id} onPress={() => setSelectedReason(reason)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Image source={selectedReason?.id === reason.id ? icons.circleActive : icons.circle} />
            <Text style={{ ...texts.small, marginLeft: 12 }}>{reason.title}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={{ ...texts.default, marginBottom: 8, marginTop: 24 }}>
        {t(
          'Você pode usar o espaço abaixo para detalhar mais o cancelamento. Dessa forma conseguiremos melhorar nossos serviços:'
        )}
      </Text>
      <TextInput
        placeholder={t('Escreva sua mensagem')}
        style={{
          width: '100%',
          height: 128,
          ...borders.default,
          borderColor: colors.grey,
          backgroundColor: colors.white,
          marginBottom: 8,
          padding: 8,
        }}
        multiline
        onChangeText={setRejectionComment}
        value={rejectionComment}
        textAlignVertical="top"
      />
      <View style={{ flex: 1 }} />
      <DefaultButton
        title={t('Enviar')}
        onPress={cancelHandler}
        disabled={!selectedReason || busy}
        activityIndicator={busy}
      />
    </PaddedView>
  );
}

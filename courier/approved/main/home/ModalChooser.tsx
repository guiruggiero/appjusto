import { CourierMode } from 'appjusto-types/courier';
import React, { useContext } from 'react';
import { Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as icons from '../../../../assets/icons';
import { ApiContext } from '../../../../common/app/context';
import IconButton from '../../../../common/components/buttons/IconButton';
import PaddedView from '../../../../common/components/containers/PaddedView';
import { getCourier } from '../../../../common/store/courier/selectors';
import { borders, colors, padding, texts } from '../../../../common/styles';
import { t } from '../../../../strings';

export default function () {
  // context
  const api = useContext(ApiContext);
  // redux store
  const courier = useSelector(getCourier)!;
  const { mode } = courier;
  // side effects
  React.useEffect(() => {
    if (!mode) api.profile().updateProfile(courier.id, { mode: 'motocycle' });
  }, []);
  // UI handlers
  const modeChangeHandler = (value: CourierMode) => {
    api.profile().updateProfile(courier.id, { mode: value });
  };

  // UI
  return (
    <PaddedView
      style={{ ...borders.default, backgroundColor: colors.white, borderColor: colors.lightGrey }}
    >
      <Text style={texts.medium}>{t('Método de entrega de hoje: ')}</Text>
      <View style={{ marginTop: padding, flexDirection: 'row', justifyContent: 'space-between' }}>
        <IconButton
          title={t('Moto')}
          active={mode === 'motocycle'}
          onPress={() => modeChangeHandler('motocycle')}
          icon={icons.motoSmall}
        />
        <IconButton
          title={t('Bicicleta')}
          active={mode === 'bicycling'}
          onPress={() => modeChangeHandler('bicycling')}
          icon={icons.bikeSmall}
        />
        <IconButton
          title={t('Patinete')}
          active={mode === 'scooter'}
          onPress={() => modeChangeHandler('scooter')}
          icon={icons.scooterSmall}
        />
        <IconButton
          title={t('Carro')}
          active={mode === 'car'}
          onPress={() => modeChangeHandler('car')}
          icon={icons.carSmall}
        />
        <IconButton
          title={t('A pé')}
          active={mode === 'walking'}
          onPress={() => modeChangeHandler('walking')}
          icon={icons.onFootSmall}
        />
      </View>
    </PaddedView>
  );
}

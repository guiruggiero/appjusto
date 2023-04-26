import { Dayjs } from '@appjusto/dates';
import { ProfileChange } from '@appjusto/types';
import { Feather } from '@expo/vector-icons';
import * as cpfutils from '@fnando/cpf';
import { RouteProp } from '@react-navigation/core';
import { StackNavigationProp } from '@react-navigation/stack';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { isEmpty, trim } from 'lodash';
import React from 'react';
import { ActivityIndicator, Keyboard, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch } from 'react-redux';
import { ApiContext, AppDispatch } from '../../../../common/app/context';
import DefaultButton from '../../../../common/components/buttons/DefaultButton';
import PaddedView from '../../../../common/components/containers/PaddedView';
import DefaultInput from '../../../../common/components/inputs/DefaultInput';
import PatternInput from '../../../../common/components/inputs/PatternInput';
import {
  birthdayFormatter,
  birthdayMask,
  cpfFormatter,
  cpfMask,
  phoneFormatter,
  phoneMask,
} from '../../../../common/components/inputs/pattern-input/formatters';
import { numbersOnlyParser } from '../../../../common/components/inputs/pattern-input/parsers';
import FeedbackView from '../../../../common/components/views/FeedbackView';
import { useRequestedProfileChanges } from '../../../../common/hooks/useRequestedProfileChanges';
import { IconMotocycle } from '../../../../common/icons/icon-motocycle';
import { useProfile } from '../../../../common/store/api/profile/useProfile';
import { track, useSegmentScreen } from '../../../../common/store/api/track';
import { showToast } from '../../../../common/store/ui/actions';
import { colors, halfPadding, padding, screens, texts } from '../../../../common/styles';
import { t } from '../../../../strings';
import { ProfileParamList } from './types';

Dayjs.extend(customParseFormat);

type ScreenNavigationProp = StackNavigationProp<ProfileParamList, 'RequestProfileEdit'>;
type ScreenRouteProp = RouteProp<ProfileParamList, 'RequestProfileEdit'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export const RequestProfileEdit = ({ navigation, route }: Props) => {
  // context
  const dispatch = useDispatch<AppDispatch>();
  const api = React.useContext(ApiContext);
  // app state
  const { flavor, profile } = useProfile();
  // state
  const [name, setName] = React.useState<string>('');
  const [surname, setSurname] = React.useState<string>('');
  const [cpf, setCpf] = React.useState<string>('');
  const [phone, setPhone] = React.useState<string>('');
  const [birthday, setBirthday] = React.useState<string>('');
  const [requestSent, setRequestSent] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const requestedChanges = useRequestedProfileChanges(profile.id);
  // refs
  const nameRef = React.useRef<TextInput>(null);
  const surnameRef = React.useRef<TextInput>(null);
  const cpfRef = React.useRef<TextInput>(null);
  const birthdayRef = React.useRef<TextInput>(null);
  const phoneRef = React.useRef<TextInput>(null);
  //tracking
  useSegmentScreen('RequestProfileEdit');
  // helpers
  const hasPendingChange = Boolean(requestedChanges);
  const canSubmit =
    !isLoading &&
    (!isEmpty(name) || !isEmpty(surname) || !isEmpty(cpf) || !isEmpty(phone) || !isEmpty(birthday));
  const description = (() => {
    if (flavor === 'consumer') {
      return t(
        'Por motivos de segurança, depois que o cliente realiza o primeiro pedido, a alteração de dados pessoais somente é realizada após análise da nossa equipe.'
      );
    } else
      return t(
        'Por motivos de segurança, alterações nos dados de entregadores já aprovados somente podem ser realizadas após análise da nossa equipe.'
      );
  })();
  const userData = profile.name && profile.surname && profile.cpf && profile.phone;
  const userChanges: Partial<ProfileChange> = {};
  // side effects
  React.useEffect(() => {
    if (!requestedChanges) return;
    if (requestedChanges.name) setName(requestedChanges.name);
    if (requestedChanges.surname) setSurname(requestedChanges.surname);
    if (requestedChanges.cpf) setCpf(requestedChanges.cpf);
    if (requestedChanges.phone) setPhone(requestedChanges.phone);
    if (requestedChanges.birthday) setBirthday(requestedChanges.birthday);
  }, [requestedChanges]);
  // handlers
  const changeProfileHandler = async () => {
    Keyboard.dismiss();
    try {
      if (!isEmpty(name.trim())) userChanges.name = name.trim();
      if (!isEmpty(surname.trim())) userChanges.surname = surname.trim();
      if (!isEmpty(cpf.trim()) && cpfutils.isValid(cpf.trim())) {
        userChanges.cpf = cpf.trim();
      }
      if (!isEmpty(phone.trim())) userChanges.phone = phone.trim();
      if (!isEmpty(birthday.trim())) userChanges.birthday = birthday.trim();
      setLoading(true);
      await api.user().requestProfileChange(profile.id, userChanges);
      track('profile edit requested');
      setLoading(false);
      setRequestSent(true);
    } catch (error: any) {
      dispatch(
        showToast(
          t('Não foi realizar a operação nesse momento. Tente novamente mais tarde'),
          'error'
        )
      );
    }
  };
  //UI
  if (requestedChanges === undefined || !userData) {
    return (
      <View style={screens.centered}>
        <ActivityIndicator size="large" color={colors.green500} />
      </View>
    );
  }
  if (requestSent) {
    return (
      <FeedbackView
        header={t('Solicitação enviada!')}
        description={t('Aguarde enquanto realizamos as alterações solicitadas')}
        icon={<IconMotocycle />}
        background={colors.grey50}
      />
    );
  }
  return (
    <View style={{ ...screens.config }}>
      <KeyboardAwareScrollView
        style={{ ...screens.config }}
        enableOnAndroid
        enableAutomaticScroll
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
        scrollIndicatorInsets={{ right: 1 }}
      >
        <View style={{ flex: 1 }}>
          {!hasPendingChange ? (
            <View style={{ paddingHorizontal: padding, paddingTop: padding }}>
              <Text
                style={{
                  ...texts.x2l,
                  paddingBottom: halfPadding,
                }}
              >
                {t('Seus dados')}
              </Text>
              <Text
                style={{
                  ...texts.sm,
                  color: colors.grey700,
                  paddingBottom: padding,
                }}
              >
                {t('Edite seus dados pessoais:')}
              </Text>
            </View>
          ) : (
            <PaddedView style={{ marginBottom: padding }}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', marginBottom: halfPadding }}
              >
                <Feather name="info" size={14} />
                <Text style={{ ...texts.md, marginLeft: halfPadding, color: colors.red }}>
                  {t('Alteração em análise')}
                </Text>
              </View>
              <Text style={{ ...texts.xs }}>
                {t(
                  'Você já possui uma solicitação de alteração de dados em andamento. Aguarde enquanto analisamos a requisição para realizar uma nova.'
                )}
              </Text>
            </PaddedView>
          )}
          <View style={{ flex: 1, paddingHorizontal: padding }}>
            <DefaultInput
              ref={nameRef}
              title={t('Nome')}
              placeholder={requestedChanges?.name ?? profile.name}
              value={name}
              returnKeyType="next"
              blurOnSubmit={false}
              onChangeText={(text) => setName(text)}
              onSubmitEditing={() => surnameRef.current?.focus()}
              keyboardType="default"
              maxLength={30}
              editable={!hasPendingChange}
            />
            <DefaultInput
              ref={surnameRef}
              style={{ marginTop: padding }}
              title={t('Sobrenome')}
              placeholder={requestedChanges?.surname ?? profile.surname}
              value={surname}
              returnKeyType="next"
              blurOnSubmit={false}
              onChangeText={(text) => setSurname(text)}
              onSubmitEditing={() => cpfRef.current?.focus()}
              keyboardType="default"
              maxLength={30}
              editable={!hasPendingChange}
            />
            <PatternInput
              ref={cpfRef}
              style={{ marginTop: padding }}
              title={t('CPF')}
              value={cpf}
              placeholder={cpfFormatter(requestedChanges?.cpf ?? profile.cpf)}
              mask={cpfMask}
              parser={numbersOnlyParser}
              formatter={cpfFormatter}
              keyboardType="number-pad"
              returnKeyType="default"
              blurOnSubmit={false}
              onSubmitEditing={() => birthdayRef.current?.focus()}
              onChangeText={(text) => setCpf(trim(text))}
              editable={!hasPendingChange}
            />
            {cpf.length > 0 && !cpfutils.isValid(cpf) ? (
              <Text
                style={{
                  ...texts.sm,
                  ...texts.bold,
                  color: colors.red,
                  marginTop: padding,
                  marginLeft: 6,
                }}
              >
                {t('O CPF digitado não é válido.')}
              </Text>
            ) : null}
            <PatternInput
              ref={phoneRef}
              style={{ marginTop: padding }}
              title={t('Celular')}
              value={phone}
              placeholder={phoneFormatter(requestedChanges?.phone ?? profile.phone)}
              mask={phoneMask}
              parser={numbersOnlyParser}
              formatter={phoneFormatter}
              keyboardType="number-pad"
              returnKeyType="next"
              blurOnSubmit
              onChangeText={(text) => setPhone(trim(text))}
              editable={!hasPendingChange}
            />
            {flavor === 'courier' ? (
              <View>
                <PatternInput
                  ref={birthdayRef}
                  style={{ marginTop: padding }}
                  title={t('Data de nascimento')}
                  value={birthday}
                  placeholder={birthdayFormatter(requestedChanges?.birthday ?? profile.birthday)}
                  mask={birthdayMask}
                  parser={numbersOnlyParser}
                  formatter={birthdayFormatter}
                  keyboardType="number-pad"
                  returnKeyType="next"
                  onChangeText={(text) => setBirthday(trim(text))}
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  editable={!hasPendingChange}
                />
              </View>
            ) : null}
          </View>
        </View>
        {!hasPendingChange ? (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }} />
            <PaddedView style={{ flex: 1, backgroundColor: colors.white }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: padding }}>
                <Feather name="info" size={14} />
                <Text style={{ ...texts.md, marginLeft: halfPadding }}>
                  {t('Informações sobre a alteração de dados')}
                </Text>
              </View>
              <Text style={{ ...texts.xs, marginBottom: padding }}>{description}</Text>
              <View style={{ flex: 1 }} />
              <DefaultButton
                title={t('Solicitar alteração')}
                onPress={changeProfileHandler}
                disabled={hasPendingChange || !canSubmit}
              />
            </PaddedView>
          </View>
        ) : null}
      </KeyboardAwareScrollView>
    </View>
  );
};

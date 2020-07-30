import { useNavigation } from '@react-navigation/native';
import React, { useState, useContext, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { logoWhite, arrow, illustration } from '../../../assets/icons';
import useAuth, { AuthState } from '../../../hooks/useAuth';
import { showToast } from '../../../store/actions/ui';
import { signInWithEmail } from '../../../store/actions/user';
import { getEnv } from '../../../store/selectors/config';
import { t } from '../../../strings';
import { ApiContext } from '../../../utils/context';
import { validateEmail, userDataPending } from '../../../utils/validators';
import AvoidingView from '../../common/AvoidingView';
import DefaultButton from '../../common/DefaultButton';
import DefaultInput from '../../common/DefaultInput';
import { colors, texts, padding, screens } from '../../common/styles';

export default function ConsumerIntro() {
  // context
  const api = useContext(ApiContext);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // state
  const dev = useSelector(getEnv) === 'development';
  const [email, setEmail] = useState(dev ? 'pdandradeb@gmail.com' : '');
  const [sendingLink, setSendingLink] = useState(false);
  const [authState, user] = useAuth();

  // side effects
  useEffect(() => {
    if (!user) return;
    if (authState !== AuthState.SignedIn) return;
    if (userDataPending(user)) {
      navigation.navigate('ConsumerRegistration');
    }
  }, [authState, user]);

  // handlers
  const signInHandler = useCallback(async () => {
    if (validateEmail(email).status === 'ok') {
      dispatch(showToast(t('Enviando link de autenticação para o seu e-mail...')));
      setSendingLink(true);
      await signInWithEmail(api)(email);
      navigation.navigate('ConsumerConfirmation', { email });
    } else {
      // TODO: handle error
    }
  }, [email]);

  // UI
  return (
    <View style={[screens.default, { marginBottom: 0 }]}>
      <View style={{ flex: 1 }}>
        <AvoidingView style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={{ paddingHorizontal: padding }}>
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View>
                  <View style={{ height: 200, marginTop: 30, width: 275 }}>
                    <Image source={illustration} />
                  </View>

                  <View style={{ height: 80, marginTop: 16, width: '50%' }}>
                    <Image style={{ width: '100%', height: '100%' }} source={logoWhite} />
                  </View>

                  <View style={{ height: 58, marginTop: 16 }}>
                    <Text style={[texts.big]}>
                      {t('Somos um delivery aberto, transparente e consciente.')}
                    </Text>
                  </View>

                  <View style={{ width: '85%', height: 58, marginVertical: 16 }}>
                    <Text style={[texts.default, { color: colors.darkGrey }]}>
                      {t('A plataforma de entregas mais justa, transparente e aberta disponível.')}
                    </Text>
                  </View>
                </View>
              </TouchableWithoutFeedback>

              <DefaultInput
                value={email}
                title={t('Acesse sua conta')}
                placeholder={t('Digite seu e-mail')}
                onChangeText={setEmail}
                keyboardType="email-address"
                blurOnSubmit
                autoCapitalize="none"
              >
                <DefaultButton
                  disabled={!validateEmail(email) || sendingLink}
                  title={t('Entrar')}
                  onPress={signInHandler}
                />
              </DefaultInput>

              {/* dummy view to accomadate keyboard better */}
              <View style={{ height: 20 }} />
            </View>

            <View style={{ flex: 1 }} />

            {/* sign up */}
            <View style={styles.bottomContainer}>
              <View style={styles.innerContainer}>
                <View style={{ width: 150 }}>
                  <Text style={[texts.default]} numberOfLines={2}>
                    {t('Faça parte desse movimento')}
                    <Image source={arrow} width={11} height={4} />
                  </Text>
                </View>
                <DefaultButton
                  title={t('Cadastre-se agora')}
                  onPress={() => navigation.navigate('ConsumerRegistration')}
                />
              </View>
            </View>
          </View>
        </AvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomContainer: {
    width: '100%',
    height: 80,
    flexDirection: 'row',
    backgroundColor: colors.lightGrey,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  innerContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
});

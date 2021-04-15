import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  ImageURISource,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { useMutation } from 'react-query';
import { useDispatch } from 'react-redux';
import { box, house } from '../../../assets/icons';
import { ApiContext, AppDispatch } from '../../../common/app/context';
import DefaultButton from '../../../common/components/buttons/DefaultButton';
import PaddedView from '../../../common/components/containers/PaddedView';
import DefaultInput from '../../../common/components/inputs/DefaultInput';
import useObserveOrder from '../../../common/store/api/order/hooks/useObserveOrder';
import { borders, colors, halfPadding, padding, screens, texts } from '../../../common/styles';
import { t } from '../../../strings';
import { defaultImageOptions } from '../main/profile/photos/ProfilePhotos';
import { ApprovedParamList } from '../types';
import { OngoingDeliveryNavigatorParamList } from './types';

type ScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<OngoingDeliveryNavigatorParamList, 'NoCodeDelivery'>,
  StackNavigationProp<ApprovedParamList>
>;
type ScreenRoute = RouteProp<OngoingDeliveryNavigatorParamList, 'NoCodeDelivery'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRoute;
};

export const NoCodeDelivery = ({ navigation, route }: Props) => {
  // params
  const { orderId } = route.params;
  // context
  const api = React.useContext(ApiContext);
  const dispatch = useDispatch<AppDispatch>();
  // state
  const { order } = useObserveOrder(orderId);
  // const issues = useIssues('no-code-delivery');
  // const [selectedIssue, setSelectedIssue] = React.useState<WithId<Issue>>();
  const [isLoading, setLoading] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [packagePhoto, setPackagePhoto] = React.useState<ImageURISource | undefined | null>();
  const [frontPhoto, setFrontPhoto] = React.useState<ImageURISource | undefined | null>();
  const uploadPODPackage = useMutation((localUri: string) =>
    api.courier().uploadPODPackage(orderId, order!.courier!.id, localUri)
  );
  const uploadPODFront = useMutation((localUri: string) =>
    api.courier().uploadPODFront(orderId, order!.courier!.id, localUri)
  );
  // side effects
  //upload POD package photo
  React.useEffect(() => {
    if (packagePhoto?.uri) {
      uploadPODPackage.mutate(packagePhoto.uri);
    }
  }, [packagePhoto]);
  //upload POD front photo
  React.useEffect(() => {
    if (frontPhoto?.uri) {
      uploadPODFront.mutate(frontPhoto.uri);
    }
  }, [frontPhoto]);
  //refs
  const descriptionRef = React.useRef<TextInput>(null);
  // UI handlers
  const photoHandler = async (type: 'package' | 'front', aspect: [number, number]) => {
    const { granted } = await Permissions.askAsync(Permissions.CAMERA);
    if (granted) {
      const result = await ImagePicker.launchCameraAsync({ ...defaultImageOptions, aspect });
      if (result.cancelled) return;
      if (type === 'package') setPackagePhoto(result);
      else if (type === 'front') setFrontPhoto(result);
    } else {
      navigation.navigate('PermissionDenied', {
        title: t('Precisamos acessar sua câmera'),
        subtitle: t('Clique no botão abaixo para acessar as configurações do seu dispositivo.'),
      });
    }
  };
  // UI
  if (!order) {
    return (
      <View style={screens.centered}>
        <ActivityIndicator size="large" color={colors.green500} />
      </View>
    );
  }
  // const confirmHandler = () => {
  //   if (!selectedIssue) return;
  //   (async () => {
  //     try {
  //       setLoading(true);
  //       await api.order().createIssue(orderId, {
  //         issue: selectedIssue,
  //       });
  //       setLoading(false);
  //       navigation.navigate('OngoingDelivery', { orderId, completeWithoutConfirmation: true });
  //     } catch (error) {
  //       dispatch(showToast(error.toString(), 'error'));
  //     }
  //   })();
  // };
  return (
    <ScrollView style={{ ...screens.default }} contentContainerStyle={{ flex: 1 }}>
      <PaddedView style={{ flex: 1 }}>
        <DefaultInput
          title={t('Nome do recebedor')}
          placeholder={t('Nome de quem recebeu a encomenda')}
          value={name}
          returnKeyType="next"
          blurOnSubmit={false}
          onChangeText={(text) => setName(text)}
          onSubmitEditing={() => descriptionRef.current?.focus()}
          keyboardType="default"
        />
        <DefaultInput
          ref={descriptionRef}
          title={t('Descrição adicional')}
          placeholder={t('Se quiser, escreva uma descrição (por exemplo, encomenda na portaria)')}
          value={description}
          returnKeyType="next"
          blurOnSubmit
          onChangeText={(text) => setDescription(text)}
          keyboardType="default"
          style={{ marginVertical: padding, height: 96, flexWrap: 'wrap' }}
          multiline
        />
        <Text style={{ ...texts.sm }}>
          {t('Agora, tire uma foto da encomenda e da fachada do local de entrega:')}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: padding,
          }}
        >
          <TouchableOpacity onPress={() => photoHandler('package', [1, 1])}>
            <View
              style={{
                ...borders.default,
                height: 160,
                width: 160,
                backgroundColor: colors.grey50,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={packagePhoto ?? box}
                  resizeMode="cover"
                  style={packagePhoto ? styles.photo : styles.icon}
                />
                {!packagePhoto && (
                  <Text style={{ ...texts.xs, marginTop: halfPadding }}>
                    {t('Foto da encomenda')}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => photoHandler('front', [1, 1])}>
            <View
              style={{
                ...borders.default,
                height: 160,
                width: 160,
                backgroundColor: colors.grey50,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View style={{ alignItems: 'center' }}>
                <Image
                  source={frontPhoto ?? house}
                  resizeMode="cover"
                  style={frontPhoto ? styles.photo : styles.icon}
                />
                {!frontPhoto && (
                  <Text style={{ ...texts.xs, marginTop: halfPadding }}>
                    {t('Foto da fachada')}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1 }} />
        <DefaultButton
          title={t('Confirmar entrega')}
          onPress={() => null}
          activityIndicator={isLoading}
        />
      </PaddedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  icon: {
    width: 40,
    height: 40,
  },
  photo: {
    borderRadius: 8,
    height: 160,
    width: 160,
  },
});

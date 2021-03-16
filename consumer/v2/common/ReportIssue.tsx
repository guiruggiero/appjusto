import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Issue, IssueType, WithId } from 'appjusto-types';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import { ApiContext, AppDispatch } from '../../../common/app/context';
import DefaultButton from '../../../common/components/buttons/DefaultButton';
import RadioButton from '../../../common/components/buttons/RadioButton';
import PaddedView from '../../../common/components/containers/PaddedView';
import DefaultInput from '../../../common/components/inputs/DefaultInput';
import FeedbackView from '../../../common/components/views/FeedbackView';
import { IconMotocycle } from '../../../common/icons/icon-motocycle';
import useIssues from '../../../common/store/api/platform/hooks/useIssues';
import { getCourier } from '../../../common/store/courier/selectors';
import { showToast } from '../../../common/store/ui/actions';
import { colors, halfPadding, padding, screens, texts } from '../../../common/styles';
import { t } from '../../../strings';
import { DeliveredOrderNavigatorParamList } from '../delivered/types';
import { OngoingOrderNavigatorParamList } from '../ongoing/types';
import { LoggedNavigatorParamList } from '../types';

export type ReportIssueParamList = {
  ReportIssue: {
    issueType: IssueType;
    orderId: string;
  };
};

type ScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<
    OngoingOrderNavigatorParamList & DeliveredOrderNavigatorParamList,
    'ReportIssue'
  >,
  StackNavigationProp<LoggedNavigatorParamList>
>;
type ScreenRouteProp = RouteProp<ReportIssueParamList, 'ReportIssue'>;

type Props = {
  navigation: ScreenNavigationProp;
  route: ScreenRouteProp;
};

export const ReportIssue = ({ navigation, route }: Props) => {
  // params
  const { orderId, issueType } = route.params;
  // context
  const api = React.useContext(ApiContext);
  const dispatch = useDispatch<AppDispatch>();
  // state
  const courier = useSelector(getCourier)!;
  const issues = useIssues(issueType);
  const [selectedIssue, setSelectedIssue] = React.useState<WithId<Issue>>();
  const [comment, setComment] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);
  const [issueSent, setIssueSent] = React.useState(false);

  const toastMessage = (() => {
    if (issueType === 'consumer-delivery-problem') {
      return t('Não foi possível enviar a reclamação. Tente novamente.');
    }
    if (issueType === 'courier-delivery-problem') {
      return t('Não foi possível enviar a reclamação. Tente novamente.');
    }
    if (issueType === 'courier-refuse') {
      return t('Não foi possível enviar o comentário');
    } else {
      return '';
    }
  })();
  const feedbackHeaderTitle = (() => {
    if (issueType === 'consumer-delivery-problem') {
      return t('Obrigado pelas informações. Iremos analisar o ocorrido.');
    }
    if (issueType === 'courier-delivery-problem') {
      return t('Aguarde enquanto estamos analisando o seu problema.');
    } else {
      return '';
    }
  })();
  const feedbackDescription = (() => {
    if (issueType === 'consumer-delivery-problem') {
      return undefined;
    }
    if (issueType === 'courier-delivery-problem') {
      return t('Em breve entraremos em contato com você para relatar a resolução do seu problema.');
    } else {
      return undefined;
    }
  })();
  const title = (() => {
    if (issueType === 'courier-refuse') {
      return t('Porque você recusou o pedido?');
    } else {
      return t('Qual o seu problema?');
    }
  })();
  const inputHeader = (() => {
    if (issueType === 'courier-refuse') {
      return t(
        'Você pode usar o espaço abaixo para detalhar mais sua recusa, dessa forma conseguiremos melhorar nossos serviços:'
      );
    } else {
      return t('Você pode detalhar mais seu problema:');
    }
  })();
  // handlers
  const issueHandler = () => {
    if (!selectedIssue) return;
    if (issueType === 'courier-refuse') {
      (async () => {
        setLoading(true);
        try {
          await api.order().rejectOrder(orderId, {
            courierId: courier.id,
            issue: selectedIssue,
            comment,
          });
          navigation.navigate('MainNavigator', { screen: 'Home' });
        } catch (error) {
          dispatch(showToast(t('Não foi possível enviar o comentário')));
        }
        setLoading(false);
      })();
    } else {
      (async () => {
        try {
          setLoading(true);
          await api.order().createIssue(orderId, {
            issue: selectedIssue,
            comment,
          });
          setLoading(false);
          setIssueSent(true);
        } catch (error) {
          dispatch(showToast(toastMessage));
        }
      })();
    }
  };
  // UI
  if (!issues) {
    return (
      <View style={screens.centered}>
        <ActivityIndicator size="large" color={colors.green500} />
      </View>
    );
  }
  // add right header and description for each case
  if (issueSent) {
    return (
      <FeedbackView
        header={feedbackHeaderTitle}
        icon={<IconMotocycle />}
        background={colors.grey50}
        description={feedbackDescription}
      >
        <DefaultButton
          title={t('Voltar para o início')}
          onPress={() => navigation.navigate('MainNavigator', { screen: 'Home' })}
        />
      </FeedbackView>
    );
  }
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ ...screens.config }}
      keyboardShouldPersistTaps="always"
    >
      <PaddedView>
        <Text style={{ ...texts.xl, marginBottom: padding }}>{title}</Text>
        {issues.map((issue) => (
          <View style={{ marginBottom: padding }} key={issue.id}>
            <RadioButton
              title={issue.title}
              onPress={() => setSelectedIssue(issue)}
              checked={selectedIssue?.id === issue.id}
            />
          </View>
        ))}
        <Text
          style={{
            ...texts.xl,
            color: colors.grey700,
            marginTop: 24,
            marginBottom: halfPadding,
          }}
        >
          {inputHeader}
        </Text>
        <DefaultInput
          style={{ height: 82 }}
          placeholder={t('Escreva sua mensagem')}
          multiline
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
          blurOnSubmit
        />
      </PaddedView>
      <View style={{ flex: 1 }} />
      <PaddedView>
        <DefaultButton
          title={t('Enviar')}
          onPress={issueHandler}
          activityIndicator={isLoading}
          disabled={!selectedIssue || isLoading}
        />
      </PaddedView>
      {/* {issueType === 'courier-delivery-problem' && (
        <View style={{ backgroundColor: colors.white }}>
          <SingleHeader title={t('Estou com um problema urgente')} />
          <PaddedView>
            <DefaultButton
              title={t('Iniciar suport com o AppJusto')}
              secondary
              onPress={() => null}
            />
          </PaddedView>
        </View>
      )} */}
    </KeyboardAwareScrollView>
  );
};
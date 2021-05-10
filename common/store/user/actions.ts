import {
  ConsumerProfile,
  CourierProfile,
  DeleteAccountPayload,
  Flavor,
  UserProfile,
  WithId,
} from '@appjusto/types';
import AsyncStorage from '@react-native-community/async-storage';
import * as Sentry from 'sentry-expo';
import { Environment } from '../../../config/types';
import { AppDispatch } from '../../app/context';
import Api from '../api/api';
import { awaitWithFeedback } from '../ui/actions';

export const USER_LOGGED_IN = 'USER_LOGGED_IN';
export const USER_LOGGED_OUT = 'USER_LOGGED_OUT';
export const CONSUMER_PROFILE_UPDATED = 'CONSUMER_PROFILE_UPDATED';
export const COURIER_PROFILE_UPDATED = 'COURIER_PROFILE_UPDATED';

export const observeAuthState = (api: Api) => (dispatch: AppDispatch) => {
  const unsubscribe = api.auth().observeAuthState((user) => {
    if (user) {
      dispatch({ type: USER_LOGGED_IN, payload: user });
      Sentry.Native.setUser({ id: user.uid, email: user.email! });
    } else {
      dispatch({ type: USER_LOGGED_OUT });
      Sentry.Native.configureScope((scope) => scope.setUser(null));
    }
  });
  return unsubscribe;
};

export const signInWithEmail = (api: Api) => (email: string, environment: Environment) => async (
  dispatch: AppDispatch
) => {
  try {
    AsyncStorage.setItem('email', email);
  } catch (error) {
    console.log(error);
    Sentry.Native.captureException(error);
  }
  return dispatch(awaitWithFeedback(api.auth().sendSignInLinkToEmail(email, environment)));
};

export const getSignInEmail = () => {
  try {
    return AsyncStorage.getItem('email');
  } catch (error) {
    console.log(error);
    Sentry.Native.captureException(error);
    return Promise.resolve(null);
  }
};

export const isSignInWithEmailLink = (api: Api) => (link: string | null): boolean => {
  return api.auth().isSignInWithEmailLink(link);
};

export const signInWithEmailLink = (api: Api) => (email: string, link: string) => {
  return api.auth().signInWithEmailLink(email, link);
};

export const signOut = (api: Api) => {
  return api.auth().signOut();
};

export const deleteAccount = (api: Api) => (payload: Partial<DeleteAccountPayload>) => async (
  dispatch: AppDispatch
) => {
  await dispatch(awaitWithFeedback(api.auth().deleteAccount(payload)));
  dispatch({ type: USER_LOGGED_OUT });
};

// watch for updates
export const observeProfile = (api: Api) => (flavor: Flavor, id: string) => (
  dispatch: AppDispatch
) => {
  return api.profile().observeProfile(id, (profile: WithId<UserProfile>): void => {
    const actionType = flavor === 'consumer' ? CONSUMER_PROFILE_UPDATED : COURIER_PROFILE_UPDATED;
    dispatch({ type: actionType, payload: profile });
  });
};

export const updateProfile = (api: Api) => (
  id: string,
  changes: Partial<CourierProfile> | Partial<ConsumerProfile>
) => async (dispatch: AppDispatch) => {
  return dispatch(awaitWithFeedback(api.profile().updateProfile(id, changes)));
};

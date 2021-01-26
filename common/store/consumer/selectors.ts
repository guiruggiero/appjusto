import { createSelector } from 'reselect';
import { State } from '..';
import { ConsumerState } from './types';

export const getConsumerState = (state: State): ConsumerState => state.consumer;

export const getConsumer = createSelector(
  getConsumerState,
  (consumerState) => consumerState.consumer
);

export const getCurrentLocation = (state: State) => getConsumerState(state).currentLocation;
export const getCurrentPlace = (state: State) => getConsumerState(state).currentPlace;

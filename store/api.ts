import axios from 'axios';
import firebase from 'firebase';
import 'firebase/firestore';
import * as geofirestore from 'geofirestore';

import { Extra } from '../utils/config';
import { Consumer } from './consumer/types';
import { Courier } from './courier/types';
import { Place } from './types';

export default class Api {
  private firestore: firebase.firestore.Firestore;
  private firestoreWithGeo: geofirestore.GeoFirestore;
  private functionsEndpoint: string;

  constructor(private extra: Extra) {
    firebase.initializeApp(extra.firebase);

    // firebase.auth().setPersistence('local');

    this.firestore = firebase.firestore();
    this.firestoreWithGeo = geofirestore.initializeApp(this.firestore);

    if (!extra.firebase.emulator.enabled) {
      this.functionsEndpoint = extra.firebase.functionsURL;
    } else {
      this.firestore.settings({
        host: extra.firebase.emulator.databaseURL,
        ssl: false,
      });
      // this is the advertised way to do it but is throwing an excepting for any reason
      // firebase.functions().useFunctionsEmulator(firebaseConfig.emulator.functionsURL);
      this.functionsEndpoint = extra.firebase.emulator.functionsURL;
    }
  }

  // authentication

  observeAuthState(handler: (a: firebase.User | null) => any): firebase.Unsubscribe {
    const auth = firebase.auth();
    const unsubscribe = auth.onAuthStateChanged(handler);
    return unsubscribe;
  }

  sendSignInLinkToEmail(email: string): Promise<void> {
    firebase.auth().languageCode = 'pt'; // i18n
    return firebase.auth().sendSignInLinkToEmail(email, {
      url: `https://appjusto.com.br/app/${this.extra.flavor}/join?something=else'`,
      handleCodeInApp: true,
      iOS: {
        bundleId: this.extra.bundleIdentifier,
      },
      android: {
        packageName: this.extra.androidPackage,
        installApp: true,
      },
      dynamicLinkDomain: 'appjusto.com.br',
    });
  }

  isSignInWithEmailLink(link: string): boolean {
    return firebase.auth().isSignInWithEmailLink(link);
  }

  async signInWithEmailLink(email: string, link: string) {
    const userCredential = await firebase.auth().signInWithEmailLink(email, link);
    return userCredential.user;
  }

  updateProfile(profile: { displayName?: string | null; photoURL?: string | null }) {
    return firebase.auth().currentUser?.updateProfile(profile);
  }

  signOut() {
    return firebase.auth().signOut();
  }

  // couriers

  updateCourier(courierId: string, changes: object) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const courierDoc = this.firestore.collection('couriers').doc(courierId);
    return courierDoc.set(
      {
        ...changes,
        timestamp,
      },
      { merge: true }
    );
  }

  updateCourierLocation(courier: Courier, location) {
    const { coords } = location;

    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    // SECURITY TODO: this action should be restricted only to the courier himself and admins
    // TODO: create a job to synthesize or remove old data
    const courierLocationRef = this.firestoreWithGeo
      .collection('locations')
      .doc('couriers')
      .collection(courier.status!)
      .doc(courier.id);
    const courierInfo = {};
    // workaround for testing in simulators when there's no notification token available
    if (courier.notificationToken) courierInfo.notificationToken = courier.notificationToken;

    return courierLocationRef.set(
      {
        coordinates: new firebase.firestore.GeoPoint(coords.latitude, coords.longitude),
        // accuracy: coords.accuracy,
        // altitude: coords.altitude,
        // altitudeAccuracy: coords.altitudeAccuracy,
        // heading: coords.heading,
        // speed: coords.speed,
        ...courierInfo,
        timestamp,
      },
      { merge: true }
    );
  }

  watchCourier(courierId: string, resultHandler: (courier: Courier) => void): firebase.Unsubscribe {
    // TODO: ensure only people envolved in order are able to know courier's location
    const unsubscribe = this.firestore
      .collection('couriers')
      .doc(courierId)
      .onSnapshot((doc) => {
        resultHandler({ ...doc.data(), id: doc.id });
      });
    // returns the unsubscribe function
    return unsubscribe;
  }

  watchAvailableCouriers(resultHandler): firebase.Unsubscribe {
    // TODO: add query filters to limit to couriers:
    // 1 close to a specific location
    // 2 max number of results
    const unsubscribe = this.firestore
      .collection('locations/couriers/available')
      .onSnapshot((query) => {
        const result: Courier[] = [];
        query.forEach((doc) => {
          result.push({ ...doc.data(), id: doc.id });
        });
        resultHandler(result);
      });
    // returns the unsubscribe function
    return unsubscribe;
  }

  // consumers

  updateConsumer(consumerId: string, changes: object) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    const courierDoc = this.firestore.collection('consumers').doc(consumerId);
    return courierDoc.set(
      {
        ...changes,
        timestamp,
      },
      { merge: true }
    );
  }

  watchConsumer(
    consumerId: string,
    resultHandler: (consumer: Consumer) => void
  ): firebase.Unsubscribe {
    const unsubscribe = this.firestore
      .collection('consumers')
      .doc(consumerId)
      .onSnapshot((doc) => {
        resultHandler({ ...doc.data(), id: doc.id });
      });
    // returns the unsubscribe function
    return unsubscribe;
  }

  // orders

  async createOrder(origin: Place, destination: Place) {
    const params = {
      origin,
      destination,
    };
    try {
      const url = `${this.functionsEndpoint}/createOrder`;
      const response = await axios.post(url, params);
      return response.data;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async confirmOrder(orderId: string, cardId: string) {
    const params = {
      orderId,
      cardId,
    };
    try {
      const url = `${this.functionsEndpoint}/confirmOrder`;
      const response = await axios.post(url, params);
      return response.data;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async matchOrder(orderId: string) {
    const params = {
      orderId,
    };
    try {
      const url = `${this.functionsEndpoint}/matchOrder`;
      const response = await axios.post(url, params);
      return response.data;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  // maps

  async googlePlacesAutocomplete(input: string, sessiontoken: string) {
    // TODO: location & radius?
    const url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const params = {
      key: this.extra.googleMapsApiKey,
      input,
      sessiontoken,
      types: 'address',
      components: 'country:BR', // i18n
      language: 'pt-BR', // i18n
    };
    try {
      const response = await axios.get(url, { params });
      return response.data;
    } catch (err) {
      console.log(err);
      return err;
    }
  }

  async googleGeocode(address: string) {
    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    const params = {
      key: this.extra.googleMapsApiKey,
      address,
      region: 'br', // i18n
      components: 'country:BR', // i18n
      language: 'pt-BR', // i18n
    };
    try {
      const response = await axios.get(url, { params });
      const { data } = response;
      const { results } = data;
      const [result] = results;
      const { geometry } = result;
      const { location } = geometry;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } catch (err) {
      console.log(err);
      return err;
    }
  }
}

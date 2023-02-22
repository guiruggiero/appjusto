import {
  AdvanceReceivablesByAmountPayload,
  AdvanceReceivablesPayload,
  CourierOrderRequest,
  FetchAdvanceByAmountSimulationPayload,
  LedgerEntry,
} from '@appjusto/types';
import { IuguMarketplaceAccountAdvanceSimulation } from '@appjusto/types/payment/iugu';
import {
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import * as Sentry from 'sentry-expo';
import { WithId } from '../../../../../types';
import { getAppVersion } from '../../../utils/version';
import { FirestoreRefs } from '../../refs/FirestoreRefs';
import { FunctionsRef } from '../../refs/FunctionsRef';
import { StoragePaths } from '../../refs/StoragePaths';
import FilesApi from '../files';
import { documentAs, documentsAs } from '../types';

export default class CourierApi {
  constructor(
    private firestoreRefs: FirestoreRefs,
    private functionsRef: FunctionsRef,
    private storagePaths: StoragePaths,
    private files: FilesApi,
    private emulated: boolean
  ) {}

  // firestore
  observeActiveRequests(
    courierId: string,
    resultHandler: (orders: WithId<CourierOrderRequest>[]) => void
  ): Unsubscribe {
    const constraints = [
      where('courierId', '==', courierId),
      where('situation', 'in', ['pending', 'viewed']),
      orderBy('createdOn', 'desc'),
    ];
    return onSnapshot(
      query(this.firestoreRefs.getCourierRequestsRef(), ...constraints),
      (snapshot) => {
        if (snapshot.empty) resultHandler([]);
        else resultHandler(documentsAs<CourierOrderRequest>(snapshot.docs));
      },
      (error) => {
        console.log(error);
        Sentry.Native.captureException(error);
      }
    );
  }

  observeOrderRequests(
    courierId: string,
    resultHandler: (orders: WithId<CourierOrderRequest>[]) => void,
    orderId: string
  ): Unsubscribe {
    const constraints = [
      where('courierId', '==', courierId),
      where('orderId', '==', orderId),
      orderBy('createdOn', 'desc'),
    ];
    return onSnapshot(
      query(this.firestoreRefs.getCourierRequestsRef(), ...constraints),
      (snapshot) => {
        if (snapshot.empty) resultHandler([]);
        else resultHandler(documentsAs<CourierOrderRequest>(snapshot.docs));
      },
      (error) => {
        console.log(error);
        Sentry.Native.captureException(error);
      }
    );
  }

  viewOrderRequest(requestId: string) {
    return updateDoc(doc(this.firestoreRefs.getCourierRequestsRef(), requestId), {
      situation: 'viewed',
      viewed: true,
    } as Partial<CourierOrderRequest>);
  }

  // ledger
  async fetchOtherLedgerEntries(courierId: string, orderId: string) {
    const snapshot = await getDocs(
      query(
        this.firestoreRefs.getLedgerRef(),
        where('to.accountId', '==', courierId),
        where('orderId', '==', orderId),
        where('status', '==', 'paid'),
        where('operation', '==', 'others'),
        limit(1)
      )
    );
    if (snapshot.empty) return null;
    return documentAs<LedgerEntry>(snapshot.docs[0]);
  }

  // callables
  async fetchAccountInformation(accountId: string) {
    return (
      await this.functionsRef.getFetchAccountInformationCallable()({
        accountType: 'courier',
        accountId,
        meta: { version: getAppVersion() },
      })
    ).data;
  }
  async requestWithdraw(accountId: string, amount: number) {
    return (
      await this.functionsRef.getRequestWithdrawCallable()({
        accountType: 'courier',
        accountId,
        amount,
        meta: { version: getAppVersion() },
      })
    ).data;
  }
  async fetchReceivables(accountId: string) {
    return (
      await this.functionsRef.getFetchReceivablesCallable()({
        accountType: 'courier',
        accountId,
        meta: { version: getAppVersion() },
      })
    ).data;
  }
  async fetchTotalWithdrawsThisMonth(accountId: string) {
    const now = new Date();
    const firstDayOfMonth = Timestamp.fromDate(
      new Date(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );
    const withdrawsRef = this.firestoreRefs.getWithdrawsRef();

    const withdrawsSnapshot = await getDocs(
      query(
        this.firestoreRefs.getWithdrawsRef(),
        where('accountId', '==', accountId),
        where('createdOn', '>=', firstDayOfMonth)
      )
    );
    return withdrawsSnapshot.size;
  }
  async fetchAdvanceSimulation(
    accountId: string,
    ids: number[]
  ): Promise<IuguMarketplaceAccountAdvanceSimulation> {
    return (
      await this.functionsRef.getFetchAdvanceSimulationCallable()({
        accountType: 'courier',
        accountId,
        ids,
        meta: { version: getAppVersion() },
      })
    ).data;
  }
  async advanceReceivables(accountId: string, ids: number[]): Promise<any> {
    const payload: AdvanceReceivablesPayload = {
      accountType: 'courier',
      accountId,
      ids,
      meta: { version: getAppVersion() },
    };
    return (await this.functionsRef.getAdvanceReceivablesCallable()(payload)).data;
  }
  async fetchAdvanceByAmountSimulation(accountId: string, amount: number): Promise<any> {
    const payload: FetchAdvanceByAmountSimulationPayload = {
      accountType: 'courier',
      accountId,
      amount,
      meta: { version: getAppVersion() },
    };
    return (await this.functionsRef.getFetchAdvanceByAmountSimulationCallable()(payload)).data;
  }

  async advanceReceivablesByAmount(
    accountId: string,
    simulationId: string,
    amount: number,
    fee: number
  ): Promise<any> {
    const payload: AdvanceReceivablesByAmountPayload = {
      accountType: 'courier',
      accountId,
      simulationId,
      amount,
      fee,
      meta: { version: getAppVersion() },
    };
    return (await this.functionsRef.getAdvanceReceivablesByAmountCallable()(payload)).data;
  }
  // storage
  // selfie
  uploadSelfie(id: string, localUri: string, progressHandler?: (progress: number) => void) {
    return this.files.upload(this.storagePaths.getCourierSelfiePath(id), localUri, progressHandler);
  }
  fetchSelfie(id: string, size?: string) {
    return this.files.getDownloadURL(
      this.storagePaths.getCourierSelfiePath(id, !this.emulated && size ? size : undefined)
    );
  }
  // document
  uploadDocumentImage(id: string, localUri: string, progressHandler?: (progress: number) => void) {
    return this.files.upload(
      this.storagePaths.getCourierDocumentPath(id),
      localUri,
      progressHandler
    );
  }
  fetchDocumentImage(id: string, size?: string) {
    return this.files.getDownloadURL(
      this.storagePaths.getCourierDocumentPath(id, !this.emulated && size ? size : undefined)
    );
  }
  // Proof of delivery
  uploadPODPackage(
    orderId: string,
    courierId: string,
    localUri: string,
    progressHandler?: (progress: number) => void
  ) {
    return this.files.upload(
      this.storagePaths.getOrderPODPackagePath(orderId, courierId),
      localUri,
      progressHandler
    );
  }
  uploadPODFront(
    orderId: string,
    courierId: string,
    localUri: string,
    progressHandler?: (progress: number) => void
  ) {
    return this.files.upload(
      this.storagePaths.getOrderPODFrontPath(orderId, courierId),
      localUri,
      progressHandler
    );
  }
}

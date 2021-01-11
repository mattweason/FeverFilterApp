import React, { useState, useEffect } from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'
import {
    initConnection,
    flushFailedPurchasesCachedAsPendingAndroid,
    validateReceiptIos,
    finishTransaction,
    finishTransactionIOS,
    purchaseErrorListener,
    purchaseUpdatedListener,
    getAvailablePurchases
} from 'react-native-iap';
import { saveNewSubscription } from '../actions/authActions'
import axios from 'axios';
import auth from "@react-native-firebase/auth";

export const IAPContext = React.createContext({
    processing: false,
    setProcessing: () => { },
    activePlan: 0,
});

export const useIap = () => React.useContext(IAPContext);

export const useGetAvailablePurchases = async () => {
    const purchases = await getAvailablePurchases();
    console.log('available purchases', purchases)
}

export const useValidateIos = async (receipt) => {
    const receiptBody = {
        'receipt-data': receipt,
        'password': 'f4395c2dbcf749a980251b06f39cf814'
    }

    let result = await validateReceiptIos(receiptBody, false) //Try production call first
    console.log(result)

    if(result.status === 21007)
        result = await validateReceiptIos(receiptBody, true) //If result shows we are in sandbox, use sandbox call

    let purchaseData = result.latest_receipt_info[0];

    let pendingProductId = result.pending_renewal_info[0].auto_renew_product_id;
    let currentProductId = result.pending_renewal_info[0].product_id;
    let autoRenewStatus = result.pending_renewal_info[0].auto_renew_status;

    let today = new Date();

    let subscriptionStatus = today < purchaseData.expires_date_ms ? (autoRenewStatus === "1" ? 2 : 12) : 13;

    let subscription = {
        latestReceipt: result.latest_receipt,
        productId: currentProductId || purchaseData.product_id,
        pendingProductId: pendingProductId,
        purchaseDate: purchaseData.original_purchase_date_ms,
        lastBillingDate: purchaseData.purchase_date_ms,
        billingDate: purchaseData.expires_date_ms,
        purchaseId: purchaseData.original_transaction_id,
        subscriptionStatus};

    return {subscription, purchaseData}
}

export const IAPManagerWrapped = (props) => {

    const [processing, setProcessing] = useState(false);

    let purchaseUpdateSubscription = null;
    let purchaseErrorSubscription = null;

    const processNewPurchase = async (purchase) => {

        const { productId, transactionReceipt, purchaseToken } = purchase;

        if (transactionReceipt !== undefined) {
            if(Platform.OS === 'ios'){
                const receiptBody = {
                    'receipt-data': transactionReceipt,
                    'password': 'f4395c2dbcf749a980251b06f39cf814'
                }

                let result = await validateReceiptIos(receiptBody, false) //Try production call first

                if(result.status === 21007)
                    result = await validateReceiptIos(receiptBody, true) //If result shows we are in sandbox, use sandbox call

                let purchaseData = result.latest_receipt_info[0];

                let pendingProductId = result.pending_renewal_info[0].auto_renew_product_id;
                let currentProductId = result.pending_renewal_info[0].product_id;
                let autoRenewStatus = result.pending_renewal_info[0].auto_renew_status;

                let today = new Date();

                let subscriptionStatus = today < purchaseData.expires_date_ms ? (autoRenewStatus ? 2 : 12) : 13;

                let subscription = {
                    latestReceipt: result.latest_receipt,
                    productId: currentProductId || productId,
                    pendingProductId: pendingProductId,
                    purchaseDate: purchaseData.original_purchase_date_ms,
                    lastBillingDate: purchaseData.purchase_date_ms,
                    billingDate: purchaseData.expires_date_ms,
                    purchaseId: purchaseData.original_transaction_id,
                    subscriptionStatus};

                props.saveNewSubscription(subscription, purchaseData)

                setProcessing(false)

            } else if(Platform.OS === 'android') {
                const idToken = await auth().currentUser.getIdTokenResult();
                axios.post('https://us-central1-feverfilter-22cc0.cloudfunctions.net/api/validate_google', {
                    productId,
                    purchaseToken
                }, {
                    headers: {
                        Authorization: 'Bearer '+idToken.token
                    }
                }).then(response => {
                    let purchaseData = response.data.data;
                    let subscription = {
                        productId: productId,
                        pendingProductId: productId,
                        purchaseDate: purchaseData.startTimeMillis,
                        lastBillingDate: purchaseData.startTimeMillis,
                        billingDate: purchaseData.expiryTimeMillis,
                        purchaseToken,
                        subscriptionStatus: 4};
                    props.saveNewSubscription(subscription, transactionReceipt)
                    setProcessing(false)
                }).catch(err => {
                    setProcessing(false)
                })
            }
        }
    }

    useEffect(() => {
        initConnection().then(() => {
            // we make sure that "ghost" pending payment are removed
            // (ghost = failed pending payment that are still marked as pending in Google's native Vending module cache)
            flushFailedPurchasesCachedAsPendingAndroid().catch(() => {
                // exception can happen here if:
                // - there are pending purchases that are still pending (we can't consume a pending purchase)
                // in any case, you might not want to do anything special with the error
            }).then(() => {
                purchaseUpdateSubscription = purchaseUpdatedListener(
                    async (purchase) => {
                        const receipt = purchase.transactionReceipt;
                        if (receipt) {
                            try {
                                if (Platform.OS === 'ios') {
                                    finishTransactionIOS(purchase.transactionId);
                                }
                                await finishTransaction(purchase);
                                await processNewPurchase(purchase);
                            } catch (ackErr) {
                                console.log('ackErr', ackErr.response);
                            }
                        }
                    },
                );
                purchaseErrorSubscription = purchaseErrorListener(
                    (error) => {
                        console.log('purchaseErrorListener', error);
                    },
                );
            })
        })

        return (() => {
            if (purchaseUpdateSubscription) {
                purchaseUpdateSubscription.remove();
                purchaseUpdateSubscription = null;
            }
            if (purchaseErrorSubscription) {
                purchaseErrorSubscription.remove();
                purchaseErrorSubscription = null;
            }
        })
    }, []);

    return (
        <IAPContext.Provider value={{
            processing: processing,
            setProcessing: setProcessing,
            activePlan: props.planId,
        }}>
            {props.children}
        </IAPContext.Provider>
    );
}

const mapStateToProps = (state) => ({
    planId: state.auth.activePlan,
});

const mapDispatchToProps = {
    saveNewSubscription
};

export const IAPManager = connect(
    mapStateToProps,
    mapDispatchToProps,
)(IAPManagerWrapped);

export default IAPManager;
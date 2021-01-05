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
                const result = await validateReceiptIos(receiptBody, true)
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
                        purchaseDate: purchaseData.startTimeMillis,
                        lastBillingDate: purchaseData.startTimeMillis,
                        billingDate: purchaseData.expiryTimeMillis,
                        purchaseToken,
                        subscriptionStatus: 4};
                    props.saveNewSubscription(subscription, transactionReceipt)
                    setProcessing(false)
                }).catch(err => {
                    console.log(err.response)
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
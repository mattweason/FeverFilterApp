import React, { useState, useEffect } from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'
import {
    InAppPurchase,
    initConnection,
    flushFailedPurchasesCachedAsPendingAndroid,
    PurchaseError,
    SubscriptionPurchase,
    validateReceiptIos,
    finishTransaction,
    finishTransactionIOS,
    purchaseErrorListener,
    purchaseUpdatedListener,
} from 'react-native-iap';
// import { API_URL } from '../constants'
import { setActivePlan } from '../actions/authActions'
import { AsyncStorage } from 'react-native'

export const IAPContext = React.createContext({
    processing: false,
    setProcessing: () => { },
    activePlan: 0,
});

export const useIap = () => React.useContext(IAPContext);

const storePlanAsync = async (planData) => {
    const userSettings = await AsyncStorage.getItem('user_settings');
    let json = JSON.parse(userSettings);
    json.plan = planData;
    await AsyncStorage.setItem('user_settings', JSON.stringify(json));
}

export const IAPManagerWrapped = (props) => {

    const [processing, setProcessing] = useState(false);

    let purchaseUpdateSubscription = null;
    let purchaseErrorSubscription = null;

    const processNewPurchase = async (purchase) => {

        const { productId, transactionReceipt } = purchase;

        if (transactionReceipt !== undefined) {
            if(Platform.OS === 'ios'){
                const receiptBody = {
                    'receipt-data': transactionReceipt,
                    'password': 'f4395c2dbcf749a980251b06f39cf814'
                }
                const result = await validateReceiptIos(receiptBody, true)
                console.log(result)
            }
        }
    }

    useEffect(() => {
        console.log('context mounted ')
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
                        console.log('purchasing')
                        const receipt = purchase.transactionReceipt;
                        if (receipt) {
                            try {
                                if (Platform.OS === 'ios') {
                                    finishTransactionIOS(purchase.transactionId);
                                }
                                await finishTransaction(purchase);
                                await processNewPurchase(purchase);
                            } catch (ackErr) {
                                console.log('ackErr', ackErr);
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
            console.log('unmount ')
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
    planId: state.auth.plan.planId,
});

const mapDispatchToProps = {
    setActivePlan
};

export const IAPManager = connect(
    mapStateToProps,
    mapDispatchToProps,
)(IAPManagerWrapped);

export default IAPManager;
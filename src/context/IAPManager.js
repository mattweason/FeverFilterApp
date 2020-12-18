import React, { useState, useEffect } from 'react'
import { Platform } from 'react-native'
import { connect } from 'react-redux'
import {
    InAppPurchase,
    PurchaseError,
    SubscriptionPurchase,
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
            fetch(API_URL + '/validate-transaction', {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    receipt: transactionReceipt,
                    productId: productId,
                    token: props.token
                })
            })
                .then(res => res.json())
                .then(data => {
                    setProcessing(false);
                    if (data.ack === 'success') {
                        storePlanAsync({ planId: productId });
                        props.setActivePlan({ planId: productId });
                    }
                })
                .catch(e => {
                    setProcessing(false);
                });
        }
    }

    useEffect(() => {
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

const mapStateToProps = (state, ownProps) => ({
    token: state.user.token,
    planId: state.user.plan.planId,
});

const mapDispatchToProps = {
    setActivePlan
};

export const IAPManager = connect(
    mapStateToProps,
    mapDispatchToProps,
)(IAPManagerWrapped);

export default IAPManager;
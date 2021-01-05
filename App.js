import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Platform, StatusBar, Alert } from 'react-native'

import SplashScreen from 'react-native-splash-screen';
import * as Permissions from 'expo-permissions';
import * as Font from 'expo-font';
import auth from '@react-native-firebase/auth';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import theme from './src/styles/theme.styles'
import {BleManager} from 'react-native-ble-plx';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging'

//Redux
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import reducer from './src/reducers';

//Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import NavigationDrawer from "./src/components/NavigationDrawer";

//Action imports
import { wifiListener, userCountry } from "./src/actions/uiActions";
import {receiveLogin, setActivePlan} from "./src/actions/authActions";

//Screen imports
import HomeScreen from "./src/screens/HomeScreen";
import AccountScreen from "./src/screens/AccountScreen";
import AuthScreen from "./src/screens/AuthScreen";
import NewDeviceScreen from "./src/screens/NewDeviceScreen";
import ManageSubscriptions from "./src/screens/ManageSubscriptions";
import QRCodeScannerScreen from "./src/screens/QRCodeScannerScreen";
import LoadingScreen from "./src/screens/LoadingScreen"
import * as RNLocalize from "react-native-localize";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

//BLE manager
const DeviceManager = new BleManager();

//In app purchases
import * as RNIap from 'react-native-iap'
import IAPManager from "./src/context/IAPManager";

const itemSubs = Platform.select({
    ios: [
        'ffsubtier1',
        'ffsubtier2',
        'ffsubtier3',
        'ffsubtier4'
    ],
    android: [
        'ffsubtier1',
        'ffsubtier2',
        'ffsubtier3',
        'ffsubtier4'
    ]
})

//configure redux store
const middleware = applyMiddleware(thunk.withExtraArgument(DeviceManager));
export const store = createStore(reducer, middleware);

const MainFlow = () => {

    return (
        <Drawer.Navigator
            initialRouteName="Home"
            drawerContent={props => <NavigationDrawer {...props} />}>
            <Drawer.Screen name="Home" component={HomeScreen} />
            <Drawer.Screen name="Account" component={AccountScreen} />
        </Drawer.Navigator>
    );
};

export default App = () => {
    const [appReady, setAppReady ] = useState(false);
    const [authCheck, setAuthCheck ] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    const getUserAccount = async (uid) => {
        const userDoc = await firestore().collection('accounts').doc(uid).get();
        if (userDoc._data){
            let userData = userDoc._data;
            userData.uid = uid;
            setIsAuthenticated(true);
            store.dispatch(receiveLogin(userData))
            if(userData.subscription) {
                let subscription = userData.subscription;
                subscription.subscriptionActive = userData.subscriptionActive;
                store.dispatch(setActivePlan(userData.subscription))
            }
            if(!authCheck) setAuthCheck(true);
        }
        else
            setTimeout(async () => {
                await getUserAccount(uid)
            }, 100)
    }

    const onAuthStateChanged = async (user) => {
        if(user){
            await getUserAccount(user.uid)
        } else{
            setIsAuthenticated(false);
            if(!authCheck) setAuthCheck(true);
        }
        SplashScreen.hide();

    }

    //Listen to the redux store and initialize app if we are both connected to the internet and the app has not yet initialized
    const connectedListener = store.subscribe(() => {
        if(store.getState().ui.isConnected){
            setIsConnected(true)
            connectedListener() //Stop listening once app is initialize
        }

    })

    useEffect( () => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        SplashScreen.hide();

        //Get subscriptions
        async function getSubs() {
            try {
                const subscriptions = await RNIap.getSubscriptions(itemSubs);
            } catch(err) {
                console.warn(err); // standardized err.code and err.message available
            }
        }
        getSubs()

        //Start listening for wifi
        //Only when we have wifi will the app initialize
        store.dispatch(wifiListener())

        initApp()

        const unsubscribe = messaging().onMessage(async remoteMessage => {
            if(remoteMessage)
                Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
        });

        return unsubscribe;

    }, [])

    const initApp = async () => {
        await Font.loadAsync({
            'Montserrat': require('./assets/fonts/Montserrat-Regular.ttf'),
            'Montserrat-light': require('./assets/fonts/Montserrat-Light.ttf'),
            'Montserrat-bold': require('./assets/fonts/Montserrat-Bold.ttf'),
            'Lato': require('./assets/fonts/Lato-Regular.ttf'),
            'Lato-light': require('./assets/fonts/Lato-Light.ttf'),
            'Lato-bold': require('./assets/fonts/Lato-Bold.ttf'),
        });

        setAppReady(true)

        if(Platform.OS === 'android')
            try {
                const { status } = await Permissions.askAsync(Permissions.LOCATION);

                if (status === 'granted') {
                    console.log("You can use location");
                } else {
                    console.log("Location permission denied");
                }
            } catch (err) {
                console.log(err)
            }

        const locales = await RNLocalize.getLocales()

        if(locales[0])
            store.dispatch(userCountry(locales[0].countryCode))

    }

    return (
        <Provider store={store}>
            <IAPManager>
                <PaperProvider>
                    <StatusBar backgroundColor={theme.COLOR_PRIMARY} />
                    <SafeAreaProvider>
                        <NavigationContainer>
                            { appReady && isConnected && authCheck ? (
                                <>
                                    { isAuthenticated ? (
                                        <Stack.Navigator
                                            initialRouteName="Main"
                                            screenOptions={{
                                                headerShown: false
                                            }}>
                                            <Stack.Screen name="Main" component={MainFlow} />
                                            <Stack.Screen name="NewDevice" component={NewDeviceScreen} />
                                            <Stack.Screen name="ManageSubscriptions" component={ManageSubscriptions} />
                                            <Stack.Screen name="QRCodeScanner" component={QRCodeScannerScreen} />
                                        </Stack.Navigator>
                                    ) : (
                                        <Stack.Navigator
                                            screenOptions={{
                                                headerShown: false
                                            }}>
                                            <Stack.Screen name="Auth" component={AuthScreen} />
                                        </Stack.Navigator>
                                    )}
                                </>
                            ) : (
                                <Stack.Navigator
                                    screenOptions={{
                                        headerShown: false
                                    }}>
                                    <Stack.Screen name="Loading" component={LoadingScreen} />
                                </Stack.Navigator>
                            )}
                        </NavigationContainer>
                    </SafeAreaProvider>
                </PaperProvider>
            </IAPManager>
        </Provider>
    )
}

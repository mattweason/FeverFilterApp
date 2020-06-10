import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native'
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import reducer from './src/reducers';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from 'react-native-splash-screen';
import * as Permissions from 'expo-permissions';
import * as Font from 'expo-font';
import auth from '@react-native-firebase/auth';
import { wifiListener, userCountry } from "./src/actions/uiActions";
import { receiveLogin } from "./src/actions/authActions";

//Screen imports
import HomeScreen from "./src/screens/HomeScreen";
import AuthScreen from "./src/screens/AuthScreen";
import LoadingScreen from "./src/screens/LoadingScreen"
import * as RNLocalize from "react-native-localize";

const Stack = createStackNavigator();

//configure redux store
const middleware = applyMiddleware(thunk);
const store = createStore(reducer, middleware);

export default App = () => {
    const [appReady, setAppReady ] = useState(false)

    const permissions = async () => {
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
    }

    const onAuthStateChanged = (user) => {
        if(user)
            store.dispatch(receiveLogin(user))
        if(!appReady) setAppReady(true);
        SplashScreen.hide();
    }

    useEffect(async () => {
        await Font.loadAsync({
            'Montserrat': require('./assets/fonts/Montserrat-Regular.ttf'),
            'Montserrat-light': require('./assets/fonts/Montserrat-Light.ttf'),
            'Montserrat-bold': require('./assets/fonts/Montserrat-Bold.ttf'),
            'Lato': require('./assets/fonts/Lato-Regular.ttf'),
            'Lato-light': require('./assets/fonts/Lato-Light.ttf'),
            'Lato-bold': require('./assets/fonts/Lato-Bold.ttf'),
        });

        store.dispatch(wifiListener())
        const getCountry = async () => {
            const locales = await RNLocalize.getLocales()
            if(locales[0])
                store.dispatch(userCountry(locales[0].countryCode))
        }

        getCountry()

        if(Platform.OS === 'android')
            await permissions();

        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        return subscriber;

    }, [])

    return (
        <Provider store={store}>
            <NavigationContainer>
                { appReady ? (
                    <>
                    { store.getState().auth.isAuthenticated ? (
                            <Stack.Navigator
                                screenOptions={{
                                    headerShown: false
                                }}>
                                <Stack.Screen name="Home" component={HomeScreen} />
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
        </Provider>
    )
}

import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Platform, StatusBar } from 'react-native'

import SplashScreen from 'react-native-splash-screen';
import * as Permissions from 'expo-permissions';
import * as Font from 'expo-font';
import auth from '@react-native-firebase/auth';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import theme from './src/styles/theme.styles'

//Redux
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import reducer from './src/reducers';

//Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';


//Action imports
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
    const [appReady, setAppReady ] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false)

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
        if(user){
            setIsAuthenticated(true);
            store.dispatch(receiveLogin(user))
        } else
            setIsAuthenticated(false);
        if(!appReady) setAppReady(true);
        SplashScreen.hide();
    }

    useEffect(() => {
        async function initApp() {
            await Font.loadAsync({
                'Montserrat': require('./assets/fonts/Montserrat-Regular.ttf'),
                'Montserrat-light': require('./assets/fonts/Montserrat-Light.ttf'),
                'Montserrat-bold': require('./assets/fonts/Montserrat-Bold.ttf'),
                'Lato': require('./assets/fonts/Lato-Regular.ttf'),
                'Lato-light': require('./assets/fonts/Lato-Light.ttf'),
                'Lato-bold': require('./assets/fonts/Lato-Bold.ttf'),
            });

            store.dispatch(wifiListener())

            const locales = await RNLocalize.getLocales()
            if(locales[0])
                store.dispatch(userCountry(locales[0].countryCode))

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

            const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        }

        initApp()

    }, [])

    return (
        <Provider store={store}>
            <PaperProvider>
                <StatusBar backgroundColor={theme.COLOR_PRIMARY} />
                <SafeAreaProvider>
                    <NavigationContainer>
                        { appReady ? (
                            <>
                                { isAuthenticated ? (
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
                </SafeAreaProvider>
            </PaperProvider>
        </Provider>
    )
}

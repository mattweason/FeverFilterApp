import 'react-native-gesture-handler';
import * as React from 'react';
import { Platform } from 'react-native'
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import reducer from './src/reducers';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from 'react-native-splash-screen';
import * as Permissions from 'expo-permissions';
import * as Font from 'expo-font'

//Screen imports
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createStackNavigator();

//configure redux store
const middleware = applyMiddleware(thunk);
const store = createStore(reducer, middleware);

export default class App extends React.Component {
    state = {
        appReady: false
    };

    async permissions() {
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

    async componentDidMount() {
        await Font.loadAsync({
            'Montserrat': require('./assets/fonts/Montserrat-Regular.ttf'),
            'Montserrat-light': require('./assets/fonts/Montserrat-Light.ttf'),
            'Montserrat-bold': require('./assets/fonts/Montserrat-Bold.ttf'),
            'Lato': require('./assets/fonts/Lato-Regular.ttf'),
            'Lato-light': require('./assets/fonts/Lato-Light.ttf'),
            'Lato-bold': require('./assets/fonts/Lato-Bold.ttf'),
        });

        if(Platform.OS === 'android'){
            await this.permissions();
            SplashScreen.hide()
        } else if (Platform.OS === 'ios'){
            SplashScreen.hide();
            await this.permissions();
        }


        this.setState({ appReady: true })
    }
    render() {
        if(this.state.appReady){
            return (
                <Provider store={store}>
                    <NavigationContainer>
                        <Stack.Navigator>
                            <Stack.Screen name="Home" component={HomeScreen} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </Provider>
            )
        } else {
            return null;
        }
    }
}

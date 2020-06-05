import 'react-native-gesture-handler';
import * as React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk'
import reducer from './src/reducers';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

//Screen imports
import HomeScreen from "./src/screens/HomeScreen";

const Stack = createStackNavigator();

//configure redux store
const middleware = applyMiddleware(thunk);
const store = createStore(reducer, middleware);

export default function App() {
  return (
      <Provider store={store}>
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
            </Stack.Navigator>
        </NavigationContainer>
      </Provider>
  );
}

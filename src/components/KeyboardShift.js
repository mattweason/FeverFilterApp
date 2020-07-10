import React from 'react';
import { Animated, Dimensions, Keyboard, StyleSheet, TextInput, UIManager, ScrollView, Platform } from 'react-native';

const { State: TextInputState } = TextInput;

class KeyboardShift extends React.PureComponent {
    state = {
        shift: new Animated.Value(0),
        keyboardHeight: 0,
        shiftValue: 0,
        keyboardShown: false
    };

    componentDidMount() {
        this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.handleKeyboardDidShow);
        this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.handleKeyboardDidHide);
    }

    componentWillUnmount() {
        this.keyboardDidShowSub.remove();
        this.keyboardDidHideSub.remove();
    }

    render() {
        const { children: renderProp } = this.props;
        const { shift } = this.state;
        return (
            <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
                <Animated.View style={[styles.container, { transform: [{translateY: shift}], paddingBottom: this.state.keyboardHeight }]}>
                    {renderProp(this.shiftUI)}
                </Animated.View>
            </ScrollView>
        );
    }

    shiftUI = (event) => {
        if(this.state.keyboardShown) {
            const { height: windowHeight } = Dimensions.get('window');
            if(event !== null) //Only set state if called through keyboard even handler
                this.setState((state) => ({...state, keyboardHeight: event.endCoordinates.height}));
            const currentlyFocusedField = TextInputState.currentlyFocusedField();
            if(currentlyFocusedField)
                UIManager.measure(currentlyFocusedField, (originX, originY, width, height, pageX, pageY) => {
                    const fieldHeight = height;
                    const fieldTop = pageY;

                    //Current gap between keyboard top and focused element top
                    const gap = (windowHeight - this.state.keyboardHeight) - (fieldTop + fieldHeight + 24);

                    //Add to shift value if pressing next input button
                    let shiftValue = this.state.shiftValue >= 0 ? gap : this.state.shiftValue + gap;

                    if(Platform.OS === "ios")
                        shiftValue -= 26;

                    //UI should only shift down
                    if (gap >= 0) {
                        return;
                    }
                    Animated.timing(
                        this.state.shift,
                        {
                            toValue: shiftValue,
                            duration: 200,
                            useNativeDriver: true,
                        }
                    ).start();

                    this.setState((state) => ({...state, shiftValue: shiftValue}))
                });
        }
    }

    handleKeyboardDidShow = (event) => {
        if(!this.state.keyboardShown)
            this.setState((state) => ({
                ...state,
                keyboardShown: true,
                keyboardHeight: event.endCoordinates.height
            }), () => {
                this.shiftUI(event, null)
            })
    }

    handleKeyboardDidHide = () => {
        //Shift value needs to be 0 at next keyboardDidShow
        if(this.state.keyboardShown){
            this.setState((state) => ({
                ...state,
                shiftValue: 0,
                keyboardHeight: 0,
                keyboardShown: false}))

            Animated.timing(
                this.state.shift,
                {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }
            ).start();
        }
    }
}

const styles = StyleSheet.create({
    container: {
        left: 0,
        top: 0,
        flex: 1
    }
});

export default KeyboardShift;
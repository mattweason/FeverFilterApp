import React, { useState } from 'react'
import { StyleSheet, View, TouchableWithoutFeedback, Animated, Easing } from 'react-native';

const IconToggle = ({size = 20, children, maxOpacity = 0.12, onPress}) => {

    const [scaleValue, setScaleValue] = useState(new Animated.Value(0.01));
    const [opacityValue, setOpacityValue] = useState(new Animated.Value(maxOpacity));

    const onPressedIn = () => {
        Animated.timing(scaleValue, {
            toValue: 1,
            duration: 225,
            easing: Easing.bezier(0.0, 0.0, 0.2, 1),
        }).start();
    };

    const onPressedOut =() => {
        Animated.timing(opacityValue, {
            toValue: 0,
        }).start(() => {
            setOpacityValue(new Animated.Value(maxOpacity));
            setScaleValue(new Animated.Value(0.01));
        });
    };

    const renderRippleView = () => {
        const rippleSize = size * 2;

        return (
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: rippleSize,
                    height: rippleSize,
                    borderRadius: rippleSize / 2,
                    transform: [{ scale: scaleValue }],
                    opacity: opacityValue,
                    backgroundColor: 'black',
                }}
            />
        );
    }
    const containerSize = size * 2;
    const iconContainer = { width: containerSize, height: containerSize };

    return (
        <TouchableWithoutFeedback onPress={onPress} onPressIn={onPressedIn} onPressOut={onPressedOut}>
            <View style={[styles.iconContainer, iconContainer]}>
                {renderRippleView()}
                <View>
                    { children }
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default IconToggle;
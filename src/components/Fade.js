import React, { useState, useEffect } from 'react';
import { Animated } from 'react-native';

const DEFAULT_DURATION = 200;

const Fade = ({visible, duration, style, children, ...props}) => {
    const [_visibility, set_visibility] = useState(new Animated.Value(visible ? 1 : 0));

    useEffect(() => {
        Animated.timing(_visibility, {
            toValue: visible ? 1 : 0,
            duration: duration ? duration : DEFAULT_DURATION,
        }).start();
    }, [visible])


    const containerStyle = {
        opacity: _visibility.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        }),
        transform: [
            {
                scale: _visibility.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.97, 1],
                }),
            },
        ],
    };

    const combinedStyle = [containerStyle, style];
    return (
        <Animated.View style={combinedStyle} {...props}>
            {children}
        </Animated.View>
    );
}

export default Fade;
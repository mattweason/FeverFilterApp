import React, {PureComponent} from 'react';
import {View, PanResponder, Animated, StyleSheet} from 'react-native';
import theme from '../styles/theme.styles';


class Slider extends PureComponent  {
    constructor(props) {
        super(props)

        this.state = {
            offset: 0,
            currentStep: 0
        }

        this.translateY = new Animated.Value(0);

        this.panResponder = PanResponder.create({
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
            onStartShouldSetPanResponder: (evt, gestureState) => true, //NEEDED FOR PAN RESPONDER TO WORK IN MODAL

            onPanResponderGrant: (e, gestureState) => {
                this.emitData();
            },

            onPanResponderMove: (e, gestureState) => {
                let y = gestureState.dy + this.state.offset;

                if(y > this.state.max)
                    y = this.state.max;
                if(y < this.state.min)
                    y = this.state.min;

                const step = this.state.max / 35;
                let stepArray = [];

                for (let i = 0; i <= 35; i++){
                    stepArray.push(i*step)
                }

                const currentStep = stepArray.reduce(function(prev, curr) {
                    return (Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev);
                });

                this.translateY.setValue(currentStep)
                this.setState({...this.state, currentStep: stepArray.indexOf(currentStep)})
            },
            onPanResponderRelease: () => {
                this.stopEmit()
                this.setState({...this.state, offset: this.translateY._value})
            }
        })
    }

    calculateStep = (max, y) => {
        const step = max / 35;
        let stepArray = [];

        for (let i = 0; i <= 35; i++){
            stepArray.push(i*step)
        }

        return stepArray.reduce(function(prev, curr) {
            return (Math.abs(curr - y) < Math.abs(prev - y) ? curr : prev);
        });
    }

    emitData = () => {
        this.interval = setInterval(() => {
            this.props.onUpdate(this.state.currentStep)
        }, this.props.delay)
    };

    stopEmit = () => {
        clearInterval(this.interval)
    }

    handleLayout = (event) => {
        const { height } = event.nativeEvent.layout;
        this.setState({min: 0, max: height - 30});

        const currentStep = this.calculateStep(height - 30, this.props.initialValue*((height-30)/35));
        this.translateY.setValue(currentStep)
        this.setState({...this.state, offset: currentStep})
    }

    render() {
        return (
            <View onLayout={this.handleLayout} style={styles.container}>
                <Bar />
                <Animated.View
                    style={{
                        transform: [{ translateY: this.translateY }],
                        height: 30,
                    }}
                    {...this.panResponder.panHandlers}
                >
                    <Circle />
                </Animated.View>
            </View>
        )
    }
}

const Bar = ({onBarLayout}) => {
    return (
        <View onLayout={onBarLayout} style={styles.bar} />
    )
}

const Circle = ({bottomOffset}) => {
    return (
        <View style={[styles.circle, {bottom: bottomOffset}]} />
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        width: 40,
        marginVertical: 20,
        flexDirection: 'row'
    },
    bar: {
        height: "100%",
        width: 16,
        borderRadius: 10,
        backgroundColor: "#F1F1F1",
        marginRight: -23
    },
    circle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: theme.COLOR_PRIMARY,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2,
    }
})

export default Slider;
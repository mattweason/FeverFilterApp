import React, {useState} from "react";
import {View, Text, StyleSheet, Dimensions, ScrollView} from 'react-native';
import Slider from "./Slider";
import theme from '../styles/theme.styles'
import {connect} from "react-redux";
import PrimaryButton from "./PrimaryButton";
import {bindActionCreators} from "redux";
import {updateThreshold} from "../actions/deviceActions";

const windowHeight = Dimensions.get('window').height;
const maxTempC = 37.5;
const maxTempF = 99.5;
const sliderHeight = windowHeight - windowHeight*0.4;

//Convert temperature to fahrenheit
const convertToF = (degree) => {
    return Math.round((degree * (9/5) + 32) * 10) / 10
}

const TemperatureThreshold = ({deviceId, initialThreshold, auth, device, toggleModal, updateThreshold}) => {
    const [threshold, setThreshold] = useState(auth.user.degreeUnit === "celsius" ? initialThreshold : convertToF(initialThreshold));
    const [tickHeight, setTickHeight] = useState(0)
    const [maxTemp, setMaxTemp] = useState(auth.user.degreeUnit === "celsius" ? maxTempC : maxTempF)
    const [segment, setSegment] = useState(auth.user.degreeUnit === "celsius" ? 35 : 65)

    const handleThresholdUpdate = (step) => {
        const currentTemp = maxTemp - (0.1*step);
        if(currentTemp !== threshold)
            setThreshold(currentTemp.toFixed(1))
    }

    const tickLayout = (event) => {
        const {height} = event.nativeEvent.layout;

        setTickHeight(height / segment)
    }

    const renderTick = (i) => {
        if (i === 0 || i % 5 === 0 )
            return <View style={styles.tick} />
        else
            return <View style={styles.minorTick} />
    }

    const renderRows = () => {
        let rows = [];

        for( let i = 0; i < segment+1; i++) {
            const temp = maxTemp - (0.1*i);
            const fixedTemp = temp.toFixed(1)
            const tempText = fixedTemp + '\u00b0' + (auth.user.degreeUnit === "celsius" ? "C" : "F");
            const topMargin = auth.user.degreeUnit === "celsius" ? "-100%" : "-200%";
            const tempDisplayIndex = auth.user.degreeUnit === "celsius" ? 5 : 10;
            rows.push(
                <View key={i} style={[styles.tempRow, {height: tickHeight}]}>
                    <Text style={{position: 'absolute', left: "-75%", fontFamily: 'Lato', fontSize: 18, top: topMargin}}>{i === 0 || i % tempDisplayIndex === 0 ? tempText : ""}</Text>
                    <View style={styles.tickRow}>
                        { renderTick(i) }
                    </View>
                </View>
            )
        }

        return rows;
    }

    const handleSubmit = () => {
        updateThreshold(deviceId, threshold, toggleModal);
    }

    return (
        <>
            <View style={styles.container}>
                <View onLayout={tickLayout} style={styles.rowContainer}>
                    { renderRows() }
                </View>
                <View style={[styles.recommended, {height: tickHeight*4+1, marginTop: tickHeight*14+segment, marginLeft: "-8%"}]}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                </View>
                <View style={{position: 'absolute', right: "5%", top: "12%", alignItems: 'center'}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={styles.temperature}>{ threshold }</Text>
                        <Text style={styles.degree}>{'\u00b0'}{ auth.user.degreeUnit === "celsius" ? "C" : "F"}</Text>
                    </View>
                    <Text style={styles.statusText}>Threshold</Text>
                </View>
                <View style={{left: "32%", position: 'absolute',height:sliderHeight}}>
                    <Slider segment={segment} initialValue={(maxTemp - initialThreshold)/0.1} onUpdate={handleThresholdUpdate} />
                </View>
                <View style={{height: sliderHeight}}/>
            </View>
            <View style={styles.modalActions}>
                <PrimaryButton disabled={device.updateThresholdRequest} mode="text" style={[styles.button, styles.cancelButton]} title={'Cancel'} onPress={toggleModal} />
                <PrimaryButton loading={device.updateThresholdRequest} disabled={device.updateThresholdRequest} style={styles.button} title="Confirm" onPress={() => handleSubmit()} />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        height: sliderHeight,
        flexDirection: 'row'
    },
    recommended: {
        backgroundColor: '#D9FFFF',
        borderRadius: 3,
        justifyContent: 'center',
        paddingRight: 6,
        paddingLeft: "24%",
        zIndex: -1
    },
    recommendedText: {
        fontFamily: 'Lato-bold',
        fontSize: 12,
        color: theme.COLOR_PRIMARY
    },
    rowContainer: {
        marginVertical: 35,
        alignItems: 'flex-end',
        width: "30%",
    },
    tempRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    tickRow: {
        width: "25%",
        alignItems: 'flex-end',
    },
    tick: {
        borderTopWidth: 1,
        borderColor: theme.COLOR_PRIMARY,
        width: '100%',
    },
    minorTick: {
        borderTopWidth: 1,
        borderColor: theme.COLOR_LIGHTERGREY,
        width: '50%',
    },
    statusText: {
        fontFamily: 'Lato',
        fontSize: 14,
        color: theme.COLOR_LIGHTERGREY
    },
    temperature: {
        fontFamily: 'Lato',
        color: theme.COLOR_TEXT,
        fontSize: 46
    },
    degree: {
        marginTop: 6,
        fontFamily: 'Lato',
        fontSize: 20,
        color: theme.COLOR_TEXT
    },
    modalActions: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button: {
        flex: 1
    },
    cancelButton: {
        marginRight: 12
    },
})


const mapStateToProps = state => {
    return {
        auth: state.auth,
        device: state.device
    }
};

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ updateThreshold }, dispatch)
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TemperatureThreshold)
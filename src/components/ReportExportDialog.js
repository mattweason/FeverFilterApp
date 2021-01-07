import React, { useState, useEffect } from 'react';
import {Text, StyleSheet, View, ActivityIndicator, Platform} from 'react-native';
import PrimaryButton from "./PrimaryButton";
import theme from "../styles/theme.styles";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {generateUsageReport, usageReportReset, getReportUsage} from "../actions/authActions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import { Snackbar } from 'react-native-paper';
import CustomModal from './CustomModal'

let initialDate = new Date();
let dateLimit = new Date();
dateLimit.setDate(dateLimit.getDate()-60)

const ReportExportDialog = ({navigation, toggleModal, auth, ui, generateUsageReport, usageReportReset, getReportUsage}) => {
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [reportLimit, setReportLimit] = useState(0);
    const [limitMax, setLimitMax] = useState(false)
    const [reportError, setReportError] = useState('');
    const [snackVisible, setSnackVisible] = useState(false)
    const [endDateModalVisible, setEndDateModalVisible] = useState(false)
    const [startDateModalVisible, setStartDateModalVisible] = useState(false)
    const [iosDateStart, setIosDateStart] = useState('')
    const [iosDateEnd, setIosDateEnd] = useState('')

    const toggleStartDateModal = () => {
        setStartDateModalVisible(!startDateModalVisible);
    }

    const toggleEndDateModal = () => {
        setEndDateModalVisible(!endDateModalVisible);
    }

    useEffect(() => {
        if(auth.exportReportUsage === null)
            getReportUsage(auth.activePlan.lastBillingDate);

        if(auth.activePlan.productId === 'ffsubtier1')
            setReportLimit(1);
        if(auth.activePlan.productId === 'ffsubtier2')
            setReportLimit(10);
        if(auth.activePlan.productId === 'ffsubtier3')
            setReportLimit(30);
        if(auth.activePlan.productId === 'ffsubtier4')
            setReportLimit(50);

        return () => {
                usageReportReset()
            }
    }, []);

    useEffect(() => {
        if(auth.usageReportSuccess)
            setSnackVisible(true)
    }, [auth.usageReportSuccess])

    useEffect(() => {
        if(auth.usageReportError)
            setReportError(auth.usageReportError)
        else
            setReportError('')
    }, [auth.usageReportFailure])

    useEffect(() => {
        if(auth.exportReportUsage >= reportLimit && auth.exportReportUsage !== null)
            setLimitMax(true);
        else
            setLimitMax(false)

    }, [auth.exportReportUsage, reportLimit])

    const showStartDatepicker = () => {
        if(Platform.OS === 'ios')
            toggleStartDateModal()
        else
        setShowStart(true);
    };

    const showEndDatepicker = () => {
        if(Platform.OS === 'ios')
            toggleEndDateModal()
        else
            setShowEnd(true)
    }

    const onStartChange = (event, selectedDate) => {
        setReportError('')
        const currentDate = selectedDate || dateStart;
        if(Platform.OS === 'android') {
            setShowStart(false);
        }
        setDateStart(currentDate);
    }

    const onEndChange = (event, selectedDate) => {
        setReportError('')
        const currentDate = selectedDate || dateEnd;
        if(Platform.OS === 'android') {
            setShowEnd(false);
        }
        setDateEnd(currentDate);
    }

    const checkDates = () => {
        if(typeof dateStart === 'string' || typeof dateEnd === 'string')
            return 'notset';
        else if (moment(dateEnd).isSame(dateStart) || moment(dateEnd).isAfter(dateStart))
            return 'valid';
        else
            return 'invalid';
    }

    const renderReportUsage = () => {
        let barWidth = (auth.exportReportUsage / reportLimit)*100;
        barWidth = barWidth+'%';
        return (
            <View style={{borderColor: '#707070', borderWidth: 1, borderRadius: 10, width: '100%', height: 20, overflow: 'hidden', marginTop: 6}}>
                <View style={{width: barWidth, borderRadius: 9, height: 18, backgroundColor: theme.COLOR_PRIMARY}} />
            </View>
        )
    }

    const handleSubmit = () => {
        let startDate = moment(dateStart).format('YYYY-MM-DD');
        let endDate = moment(dateEnd).format('YYYY-MM-DD');

        generateUsageReport(startDate, endDate);
    }

    const navigateToSubscription = () => {
        toggleModal();
        navigation.navigate('ManageSubscriptions')
        navigation.closeDrawer()
    }

    return(
        <>
            <View style={styles.mainContent}>
                { auth.exportReportUsage === null ? (
                    <ActivityIndicator size="large" color={theme.COLOR_PRIMARY} />
                ) : (
                    <>
                        { limitMax ? (
                            <>
                                <Text style={styles.maxLimit}>You have reached your report limit for this month. Upgrade your plan to increase your limit.</Text>
                                <PrimaryButton title={"Upgrade Subscription"} onPress={navigateToSubscription} />
                            </>
                        ) : (
                            <>
                                <PrimaryButton altColor style={styles.dateButton} icon={"calendar"} title={typeof dateStart === 'string' ? "Starting Date" : moment(dateStart).format('MMM D, YYYY')} onPress={showStartDatepicker} />
                                <Text style={styles.separator}>to</Text>
                                <PrimaryButton altColor style={styles.dateButton} icon={"calendar"} title={typeof dateEnd === 'string' ? "Ending Date" : moment(dateEnd).format('MMM D, YYYY')} onPress={showEndDatepicker} />
                            </>
                        )}
                        <View style={{width: '100%', marginTop: 36}}>
                            <Text style={{fontFamily: 'Montserrat-bold', fontSize: 16}}>Report Usage</Text>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 12}}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{color: theme.COLOR_PRIMARY, marginRight: 6, fontFamily: 'Lato-bold'}}>{ auth.exportReportUsage }</Text>
                                    <Text style={{fontFamily: 'Lato'}}>reports this month</Text>
                                </View>
                                <Text>{reportLimit}</Text>
                            </View>
                            { renderReportUsage() }
                        </View>
                    </>
                )}
                <View style={styles.modalActions}>
                    { checkDates() === 'invalid' && (
                        <Text style={styles.error}>Start Date must equal or precede End Date.</Text>
                    ) }
                    { reportError.length > 0 && (
                        <Text style={styles.error}>{reportError}</Text>
                    )}
                    { !ui.isConnected && (
                        <Text style={styles.error}>No network connection detected.</Text>
                    )}
                    <PrimaryButton disabled={auth.usageReportRequest} mode="text" style={[styles.button, styles.cancelButton]} title={'Cancel'} onPress={toggleModal} />
                    <PrimaryButton disabled={auth.usageReportRequest || checkDates() === 'invalid' || checkDates() === 'notset' || !ui.isConnected} loading={auth.usageReportRequest} style={styles.button} title={"Send Report"} onPress={handleSubmit} />
                </View>
                <Snackbar
                    visible={snackVisible}
                    onDismiss={() => {}}
                    duration={3000}
                    action={{
                        label: "Ok",
                        onPress: () => {
                            setSnackVisible(false)
                        },
                    }}
                >
                    Usage Report successfully sent.
                </Snackbar>
            </View>
            {showStart && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={typeof dateStart === 'object' ? dateStart : initialDate}
                    mode={'date'}
                    minimumDate={dateLimit}
                    maximumDate={new Date()}
                    display="default"
                    onChange={onStartChange}
                />
            )}
            {showEnd && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={typeof dateEnd === 'object' ? dateEnd : initialDate}
                    mode={'date'}
                    minimumDate={dateLimit}
                    maximumDate={new Date()}
                    display="default"
                    onChange={onEndChange}
                />
            )}

            <CustomModal
                visible={endDateModalVisible}
                toggleModal={toggleEndDateModal}
                content={<DateTimePicker
                    testID="dateTimePicker"
                    value={typeof dateEnd === 'object' ? dateEnd : initialDate}
                    mode={'date'}
                    minimumDate={dateLimit}
                    maximumDate={new Date()}
                    display="inline"
                    style={{marginBottom: -80, marginTop: 20}}
                    onChange={onEndChange}
                />}
                cancelButton={{title: "Cancel", action: () => {
                    setDateEnd(iosDateEnd)
                    toggleEndDateModal();
                }}}
                confirmButton={{title: "Confirm", action: () => {
                    if(dateEnd === '') {
                        setDateEnd(initialDate)
                        setIosDateEnd(initialDate)
                    } else
                        setIosDateEnd(dateEnd)
                    toggleEndDateModal();
                }}}
            />

            <CustomModal
                visible={startDateModalVisible}
                toggleModal={toggleStartDateModal}
                content={<DateTimePicker
                    testID="dateTimePicker"
                    value={typeof dateStart === 'object' ? dateStart : initialDate}
                    mode={'date'}
                    minimumDate={dateLimit}
                    maximumDate={new Date()}
                    display="inline"
                    style={{marginBottom: -80, marginTop: 20}}
                    onChange={onStartChange}
                />}
                cancelButton={{title: "Cancel", action: () => {
                    setDateStart(iosDateStart)
                    toggleStartDateModal();
                }}}
                confirmButton={{title: "Confirm", action: () => {
                    if(dateStart === '') {
                        setDateStart(initialDate)
                        setIosDateStart(initialDate)
                    }
                    setIosDateStart(dateStart)
                    toggleStartDateModal();
                }}}
            />
        </>
    )
};

const styles = StyleSheet.create({
    mainContent: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 40
    },
    dateButton: {
        width: 160
    },
    separator: {
        color: theme.COLOR_PRIMARY,
        fontFamily: 'Montserrat-bold',
        fontSize: 18,
        marginTop: 20,
        marginBottom: 20
    },
    cancelButton: {
        marginRight: 12
    },
    modalActions: {
        marginTop: 36,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button: {
        flex: 1
    },
    error: {
        position: 'absolute',
        fontSize: 14,
        color: 'red',
        bottom: 60,
        left: 6,
        textAlign: 'center',
        width: '100%'
    },
    maxLimit: {
        fontFamily: 'Lato-bold',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 12
    }
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ generateUsageReport, usageReportReset, getReportUsage }, dispatch)
};

const mapStateToProps = state => {
    return {
        auth: state.auth,
        ui: state.ui
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ReportExportDialog);
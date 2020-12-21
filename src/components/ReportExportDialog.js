import React, { useState, useEffect } from 'react';
import {Text, StyleSheet, View, ActivityIndicator} from 'react-native';
import PrimaryButton from "./PrimaryButton";
import theme from "../styles/theme.styles";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {generateUsageReport, usageReportReset, getReportUsage} from "../actions/authActions";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import { Snackbar } from 'react-native-paper';

let initialDate = new Date();
let dateLimit = new Date();
dateLimit.setDate(dateLimit.getDate()-60)

const ReportExportDialog = ({navigation, toggleModal, account, auth, ui, generateUsageReport, usageReportReset, getReportUsage}) => {
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [showStart, setShowStart] = useState(false);
    const [showEnd, setShowEnd] = useState(false);
    const [reportLimit, setReportLimit] = useState(14);
    const [limitMax, setLimitMax] = useState(false)
    const [reportError, setReportError] = useState('');
    const [snackVisible, setSnackVisible] = useState(false)

    useEffect(() => {
        if(auth.exportReportUsage === null)
            getReportUsage(moment().subtract(7, 'days'));

        if(account.subscription === 'starter')
            setReportLimit(1);
        if(account.subscription === 'basic')
            setReportLimit(10);
        if(account.subscription === 'business')
            setReportLimit(30);
        if(account.subscription === 'enterprise')
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
        if(auth.exportReportUsage >= reportLimit)
            setLimitMax(true);
    }, [auth.exportReportUsage])

    const showStartDatepicker = () => {
        setShowStart(true);
    };

    const showEndDatepicker = () => {
        setShowEnd(true)
    }

    const onStartChange = (event, selectedDate) => {
        setReportError('')
        const currentDate = selectedDate || dateStart;
        setShowStart(Platform.OS === 'ios');
        setDateStart(currentDate);
    }

    const onEndChange = (event, selectedDate) => {
        setReportError('')
        const currentDate = selectedDate || dateEnd;
        setShowEnd(Platform.OS === 'ios');
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
                    { (reportError.length === 0 && auth.usageReportFailure) && (
                        <Text style={styles.error}>There was an error.</Text>
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
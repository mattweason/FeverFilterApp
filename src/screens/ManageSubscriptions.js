import React, { useEffect, useState } from 'react';
import {View, StyleSheet, Text, ScrollView, TouchableOpacity} from 'react-native';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import PageHeader from "../components/PageHeader";
import theme from "../styles/theme.styles";
import {Feather, FontAwesome} from "@expo/vector-icons";
import {Banner, Divider} from "react-native-paper";
import PrimaryButton from "../components/PrimaryButton";
import moment from 'moment';
import { requestSubscription } from 'react-native-iap';
import { useIap } from '../context/IAPManager'

//Subscription tiers
let tiers = [
    {
        title: 'Starter',
        price: '2.99',
        reportLimit: 1,
        subId: 'ffsubtier1'
    },
    {
        title: 'Basic',
        price: '9.99',
        reportLimit: 10,
        subId: 'ffsubtier2'
    },
    {
        title: 'Business',
        price: '19.99',
        reportLimit: 30,
        subId: 'ffsubtier3'
    },
    {
        title: 'Enterprise',
        price: '29.99',
        reportLimit: 50,
        subId: 'ffsubtier4'
    }
]

const ManageSubscriptions = ({navigation, ui, auth}) => {
    const [networkBannerVisible, setNetworkBannerVisible] = useState(false);
    const [selectedTier, setSelectedTier] = useState(-1)
    const [selectedTierObject, setSelectedTierObject] = useState({})
    const [currentSubscription, setCurrentSubscription] = useState(null)
    const { processing, setProcessing } = useIap();

    // handle new subscription request
    const handleSubscription = async (pladId) => {
        try {
            setProcessing(true);
            await requestSubscription(pladId, false);
        } catch (err) {
            setProcessing(false);
        }
    }

    //Component did mount
    useEffect(() => {
        if(auth.user.subscription) {
            //Get current tier object
            let tierIndex = tiers.findIndex((tier) => {
                return tier.title === auth.user.subscription;
            });
            setSelectedTier(tierIndex);
            setSelectedTierObject(tiers[tierIndex]);
            setCurrentSubscription(auth.user.subscription)
        } else {
            setSelectedTier(2)
            setSelectedTierObject(tiers[2])
        }
    }, [])

    //No internet connection banner
    useEffect(() => {
        setNetworkBannerVisible(!ui.isConnected);
    }, [ui.isConnected])

    const selectTier = (tier) => {
        setSelectedTier(tier);
        setSelectedTierObject(tiers[tier])
    }

    const renderTiers = () => {
        return tiers.map((tier, index) => {
            let selected = selectedTier === index;
            return (
                <View key={index}>
                    <TouchableOpacity disabled={processing} onPress={() => selectTier(index)}>
                        <View style={{...styles.tierRow, backgroundColor: selected ? theme.COLOR_PRIMARY : 'transparent', opacity: processing ? 0.4 : 1}}>
                            <View style={styles.flexRow}>
                                <CustomRadioButton checked={selected} />
                                <Text style={{...styles.tierText, color: selected ? 'white' : theme.COLOR_PRIMARY}}>{tier.title}</Text>
                                { currentSubscription === tier.title && (
                                    <Text style={{fontFamily: 'Montserrat-bold', fontSize: 12, position: 'absolute', color: selected ? 'white' : theme.COLOR_PRIMARY, bottom: 20, right: 0}}>YOUR PLAN</Text>
                                )}
                            </View>
                            <View style={styles.flexRow}>
                                <Text style={{...styles.tierText, color: selected ? 'white' : theme.COLOR_PRIMARY}}>${tier.price}</Text>
                                <Text style={{...styles.tierText, color: selected ? 'white' : theme.COLOR_LIGHTGREY}}>/mo</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {index < 3 && (<Divider/>)}
                </View>
            )
        })
    }

    const renderSelectedTier = () => {
        return(
            <View style={{flexDirection: 'column'}}>
                <View style={{...styles.tierRow, paddingLeft: 24, flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text style={{...styles.tierText, color: theme.COLOR_PRIMARY}}>{selectedTierObject.title}</Text>
                    <View style={styles.flexRow}>
                        <Text style={{...styles.tierText, color: theme.COLOR_PRIMARY}}>${selectedTierObject.price}</Text>
                        <Text style={{...styles.tierText, color: theme.COLOR_LIGHTGREY}}>/mo</Text>
                    </View>
                </View>
                <Divider/>
                <View style={{...styles.flexColumn, paddingHorizontal: 12, paddingVertical: 12}}>
                    <View style={{...styles.flexRow, marginBottom: 24}}>
                        <FontAwesome style={{fontSize: 24, color: theme.COLOR_PRIMARY, marginRight: 6}} name="check"/>
                        <Text style={{fontFamily: 'Lato-bold', color: theme.COLOR_PRIMARY, fontSize: 16}}>{selectedTierObject.reportLimit}</Text>
                        <Text style={{fontFamily: 'Lato-bold', fontSize: 16}}> Device Usage Reports</Text>
                        <Text style={{fontFamily: 'Lato', fontSize: 16}}> /mo</Text>
                    </View>
                    { selectedTierObject.title === currentSubscription ? (
                        <View style={styles.flexColumn}>
                            <Text style={{fontFamily: 'Montserrat-bold', color: theme.COLOR_PRIMARY, fontSize: 16, marginBottom: 6}}>This is your current plan.</Text>
                            <View style={{...styles.flexRow, marginBottom: 12}}>
                                <Text>Next billing cycle begins </Text>
                                <Text style={{fontFamily: 'Lato-bold'}}>{moment(auth.user.nextBillingCycle).format('MMM D')}</Text>
                            </View>
                            <PrimaryButton style={{width: 120}} disabled={!ui.isConnected} mode="text" title={'Cancel'} onPress={() => {}} />
                        </View>
                    ) : (
                        <PrimaryButton style={{width: 200}} loading={processing} disabled={!ui.isConnected || processing} title={currentSubscription !== null ? 'Change Plan' : 'Choose Plan'} onPress={() => handleSubscription(selectedTierObject.subId)} />
                    )}
                </View>
            </View>
        )
    }

    return (
        <View style={{flex: 1}}>
            <PageHeader navigation={navigation} pageTitle={"Subscription"}/>
            <ScrollView>
                <View style={styles.subHeader}>
                    <Text style={styles.subTitle}>Choose Your Subscription Plan</Text>
                    <Text style={styles.subHeaderText}>Choose the subscription plan that works best for you. You can upgrade at any time.</Text>
                </View>
                <Banner
                    visible={networkBannerVisible}
                    actions={[]}
                    icon={() =>
                        <Feather style={{fontSize: 32, color: theme.COLOR_LIGHTGREY, marginLeft: 12, marginTop: -6}} name="wifi-off"/>
                    }
                >
                    <Text style={{color: theme.COLOR_LIGHTGREY, fontFamily: 'Lato', fontSize: 16}}>No network connection detected.</Text>
                </Banner>
                <View style={styles.subscriptionTiers}>
                    { renderTiers() }
                </View>
                <View style={{...styles.subscriptionTiers, marginBottom: 30}}>
                    { renderSelectedTier() }
                </View>
            </ScrollView>
        </View>
    )
};

const CustomRadioButton = ({checked}) => {
    return(
        <View style={{...styles.outerCircle, borderColor: checked ? 'white' : theme.COLOR_PRIMARY}}>
            { checked && (
                <View style={styles.innerCircle} />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    subHeader: {
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2
    },
    subTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat-bold',
        marginBottom: 6
    },
    subHeaderText: {
        color: theme.COLOR_LIGHTGREY,
        fontFamily: 'Lato'
    },
    subscriptionTiers: {
        backgroundColor: 'white',
        marginHorizontal: 24,
        marginVertical: 12,
        width: 'auto',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.5,
        elevation: 2
    },
    tierRow: {
        height: 60,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 24,
        paddingVertical: 6
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    flexColumn: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    tierText: {
        fontSize: 16,
        fontFamily: 'Montserrat-bold'
    },
    outerCircle: {
        height: 16,
        width: 16,
        borderRadius: 8,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 12
    },
    innerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: 'white'
    }
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ }, dispatch)
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
)(ManageSubscriptions);
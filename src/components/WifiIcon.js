import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

const WifiIcon = ({strength, locked = '', size}) => {

    const selectLock = () => {
        let lock = false;

        if(locked.includes('WPA') || locked.includes('WPA2-PSK') || locked.includes('WEP'))
            lock = true;

        return lock;
    }

    const selectIcon = () => {

        if(!strength)
            return require('../../assets/wifi-1.png');
        else if(strength < -70)
            return require('../../assets/wifi-1.png');
        else if(strength >= -70 && strength < -60)
            return require('../../assets/wifi-2.png');
        else if(strength >= -60 && strength < -50)
            return require('../../assets/wifi-3.png');
        else if(strength >= -50)
            return require('../../assets/wifi-4.png');
    }

    return(
        <View style={[styles.container, { width: size, height: size}]}>
            <Image style={styles.wifiImage} resizeMode="contain" source={selectIcon()}  />
            { selectLock() ? <Image style={styles.lockImage} resizeMode="contain" source={require('../../assets/wifi-lock.png')} /> : null }
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        position: 'relative'
    },
    wifiImage: {
        width: '100%',
        height: '100%'
    },
    lockImage: {
        width: '30%',
        height: '30%',
        position: 'absolute',
        bottom: 0,
        right: 0
    }
})

export default React.memo(WifiIcon);
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, StyleSheet, View, Text} from 'react-native';
import {ActivityIndicator, Button, Modal, Portal, withTheme} from "react-native-paper";
import LottieView from 'lottie-react-native';


const getAnimation = () => {
    const rndNum = Math.floor(Math.random() * 2)

    switch (rndNum) {
        case 0 :
            return require('../../assets/animations/4329-confetti.json')
        case 1 :
            return require('../../assets/animations/4963-confetti-dark-theme.json')
        default:
            return null
    }
}


const SuccessAnimation = ({visible, onDismiss, success, close, theme}) => {
    const {colors} = theme
    const animationConfetti = useRef()
    // const animationCheck = useRef()
    const [animationObj, setAnimationObj] = useState('')

    useEffect(() => {
        success && setAnimationObj(getAnimation)
    }, [success])


    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}
                   contentContainerStyle={styles.animationContainer}>
                {success
                    ? <><LottieView
                        ref={animationConfetti}
                        style={{
                            backgroundColor: 'rgb(114,141,149)',
                            alignSelf: 'center',
                            flexGrow: 1
                        }} source={animationObj} autoPlay={true} resizeMode='cover'/>
                        <Button onPress={close}>Cool</Button></>
                    : <><ActivityIndicator animating={true} size='large' color={colors.accent}/></>}
            </Modal>
        </Portal>

    );

}

const styles = StyleSheet.create({
    animationContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
    },

});

export default withTheme(SuccessAnimation)

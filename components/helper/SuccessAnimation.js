import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Easing, Text} from 'react-native';
import {ActivityIndicator, IconButton, Modal, Portal, withTheme} from "react-native-paper";
import LottieView from 'lottie-react-native';
import CtmDialog from "./CtmDialog";


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
    const animationConfetti = useRef(new Animated.Value(0)).current
    // const animationCheck = useRef()
    const [animationObj, setAnimationObj] = useState('')
    const [dialogVisible, setDialogVisible] = useState(false)

    const showDialog = () => setDialogVisible(true)
    const hideDialog = () => {
        setDialogVisible(false)
        close()

    }

    useEffect(() => {
        success && setAnimationObj(getAnimation)
        Animated.timing(animationConfetti, {
            toValue: 1,
            duration: 1,
            easing: Easing.bounce
        }).start
        const timer = setTimeout(() => {
            showDialog()
        }, 5000)
        return () => clearTimeout(timer)

    }, [success])


    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}
                   contentContainerStyle={styles.animationContainer}>
                {success
                    ? <><LottieView
                        progress={animationConfetti}
                        speed={1}
                        style={{
                            alignSelf: 'center',
                            flexGrow: 1
                        }} source={animationObj} autoPlay={true} resizeMode='cover'/>
                        <CtmDialog visible={dialogVisible} showDialog={showDialog} hideDialog={hideDialog}
                                   helpText='Deine Antworten sind bei uns angekommen, danke für Deine Teilnahme '
                                   title='Erfolgreich!'/></>
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

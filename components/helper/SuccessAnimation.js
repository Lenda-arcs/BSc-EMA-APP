import React, {useEffect, useRef, useState} from 'react';
import {Animated, StyleSheet, Easing} from 'react-native';
import {ActivityIndicator, Modal, Portal, withTheme} from "react-native-paper";
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


const SuccessAnimation = ({visible, onDismiss, success, close, theme, err}) => {
    const {colors} = theme
    const animationConfetti = useRef(new Animated.Value(0)).current

    const [animationObj, setAnimationObj] = useState('')
    const [dialogVisible, setDialogVisible] = useState(false)
    const [dialogContent, setDialogContent] = useState({
        title: 'Daten übermittelt!',
        text: 'Ihre Antworten sind angekommen, danke für Ihre Teilnahme!'
    })

    const showDialog = () => setDialogVisible(true)
    const hideDialog = () => {
        setDialogVisible(false)
        close()

    }
    useEffect(() => {
        err && setDialogContent({
            title: 'Error!',
            text: 'Hoppla!, Daten Fehler. Kontaktieren Sie uns über das Prolific Portal'
        })
    }, [err])

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
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.animationContainer}>
                {success
                    ? <>
                        <LottieView
                            progress={animationConfetti}
                            speed={1}
                            style={styles.animation}
                            source={animationObj}
                            autoPlay={true}
                            resizeMode='cover'/>
                        <CtmDialog
                            visible={dialogVisible}
                            showDialog={showDialog}
                            hideDialog={hideDialog}
                            helpText={dialogContent.text}
                            title={dialogContent.title}/>
                    </>
                    : <ActivityIndicator animating={true} size='large' color={colors.accent}/>}
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
    animation: {
        alignSelf: 'center',
        flexGrow: 1
    }

});

export default withTheme(SuccessAnimation)

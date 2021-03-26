import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Dimensions, StyleSheet, View, Text} from 'react-native';
import {Modal, Portal} from "react-native-paper";
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


const SuccessAnimation = ({visible, onDismiss}) => {
    const animationConfetti = useRef()
   // const animationCheck = useRef()
    const [animationObj] = useState(getAnimation)





    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss}
                   contentContainerStyle={styles.animationContainer}>

                <LottieView
                    ref={animationConfetti}
                    style={{
                        backgroundColor: 'rgb(114,141,149)',
                        alignSelf: 'center',
                        flexGrow: 1
                    }}
                    source={animationObj}
                    autoPlay={true}
                    resizeMode='cover'
                />
                {/*<LottieView*/}
                {/*    ref={animationCheck}*/}
                {/*    style={{*/}
                {/*        backgroundColor: 'transparent',*/}
                {/*        alignSelf: 'center',*/}
                {/*        height: 300,*/}
                {/*        width: 300*/}
                {/*    }}*/}
                {/*    source={require('../../assets/animations/lf30_editor_ofbyqwq3.json')}*/}
                {/*    // autoPlay={true}*/}
                {/*/>*/}
            </Modal>
        </Portal>

    );

}

const styles = StyleSheet.create({
    animationContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },

});

export default SuccessAnimation

import React, { useRef} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {Modal, Portal} from "react-native-paper";
import LottieView from 'lottie-react-native';

const SuccessAnimation = props => {
    const animation = useRef()
    const screenWidth = Math.round(Dimensions.get('window').width)
    const screenHeight = Math.round(Dimensions.get('window').height)


    // toDO: store several animations and select rnd for success
    const animations = []



    return (
        <Portal>
            <Modal visible={props.visible} onDismiss={props.onDismiss} contentContainerStyle={styles.animationContainer} >

                <LottieView
                    ref={animation}
                    style={{
                        width: 400 ,
                        backgroundColor: 'transparent',
                        height: 600,
                    }}
                    source={require('../../assets/animations/4329-confetti.json')}
                    autoPlay={true}
                />
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

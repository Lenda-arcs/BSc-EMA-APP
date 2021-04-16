import React, {useContext, useState, useReducer, useCallback, useEffect, useRef} from 'react'
import {Animated, StyleSheet, View, TouchableWithoutFeedback, Keyboard, ScrollView} from "react-native";
import {Headline} from 'react-native-paper'
import {useDispatch} from "react-redux";

import Input from "../components/helper/Input";
import Screen from "../components/wrapper/Screen";
import TextInputAvoidingView from "../components/helper/TextInputAvoidingView";
import CtmDialog from "../components/helper/CtmDialog";
import CtmButton from "../components/wrapper/CtmButton";

import * as authActions from '../store/actions/auth'
import {formReducer, FORM_INPUT_UPDATE} from '../helpers/ctmReducer'




const AuthScreen = props => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState()
    const [visible, setVisible] = useState(false)


    const showDialog = () => setVisible(true)
    const hideDialog = () => setVisible(false)

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {userId: '', password: ''},
        inputValidities: {userId: false, password: false},
        formIsValid: false
    });


    // Transition when Screen visible
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const fadeIn = () => {
        console.log('called')
        // Will change fadeAnim value to 0 in 3 seconds
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
        }).start();
    };
    useEffect(() => {
        fadeIn()
    },[])


    useEffect(() => {
        if (error) {
            showDialog()
        }
    }, [error])


    const dispatch = useDispatch()
    const signInHandler = async () => {
        let action //

        action = authActions.login(
            formState.inputValues.userId,
            formState.inputValues.password
        )
        setError(null)
        setIsLoading(true)
        try {
            await dispatch(action)
        } catch (err) {
            let msg = err.message
            if (err.message === 'Error: Incorrect userId or password') msg = 'Bitte gib Deine Identifikationsnummer und Dein Passwort ein'
            setError(msg)
            setIsLoading(false)
        }

    }

    const inputChangeHandler = useCallback((inputIdentifier, inputValue, inputValidity) => {
        dispatchFormState({
            type: FORM_INPUT_UPDATE,
            value: inputValue,
            isValid: inputValidity,
            input: inputIdentifier
        });
    }, [dispatchFormState])


    return (
        <Screen style={{alignItems: 'center', justifyContent: 'center'}} darkContent noSaveArea>
                <TextInputAvoidingView style={{flex: 1}}>
                    <TouchableWithoutFeedback  onPress={Keyboard.dismiss} accessible={false}>
                        <Animated.View style={{opacity: fadeAnim}}>
                            <ScrollView contentContainerStyle={styles.inner}>
                                <View style={styles.header}>
                                    <Headline style={{fontWeight: 'bold'}}>Willkommen!</Headline>
                                </View>

                                <View style={styles.actions}>
                                    <Input  id='userId' label='Teilnehmer ID' keyboardType='number-pad' required minLength={4}
                                           userId style={styles.input} icon='account' helpText='TEXT'
                                           autocapitalize='none' errorText='Bitte gebe Deine Teilnehmer Nummer ein.'
                                           onInputChange={inputChangeHandler} initialValue=''/>
                                    <Input id='password' label='Password' keyboardType='default' required minLength={5}
                                           style={styles.input} icon='lock' helpText='TEXT'
                                           autocapitalize='none' secureTextEntry errorText='Bitte gebe Dein Passwort ein.'
                                           onInputChange={inputChangeHandler} initialValue=''/>

                                </View>
                                <View style={styles.btnCtn}>
                                    <CtmButton loading={isLoading}
                                               mode='contained'
                                               disabled={!formState.formIsValid}
                                               onPress={signInHandler}>Teilnehmen</CtmButton>
                                </View>

                                <CtmDialog visible={visible} showDialog={showDialog} hideDialog={hideDialog} helpText={error}
                                           title='Fehlgeschlagen'/>
                            </ScrollView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </TextInputAvoidingView>

        </Screen>

    )

}


const styles = StyleSheet.create({
    inner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flex: .25,
        justifyContent: 'flex-end',
        marginHorizontal: 10,
        paddingBottom: 50
    },
    action: {
        marginTop: 10,
        width: '100%'
    },
    wrapper: {
        flex: 1
    },
    input:{
      width: '60%'
    },
    btnCtn: {
        width: '70%',
        marginTop: 25
    }

})

export default AuthScreen

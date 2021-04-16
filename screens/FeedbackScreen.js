import React, {useCallback, useEffect, useReducer, useState} from 'react'
import {View, StyleSheet, ScrollView} from 'react-native'
import {useDispatch} from "react-redux";

import {Headline, ToggleButton} from "react-native-paper";

import Screen from "../components/wrapper/Screen";
import TextInputAvoidingView from "../components/helper/TextInputAvoidingView";
import Input from "../components/helper/Input";
import CtmButton from "../components/wrapper/CtmButton";

import {sendFeedback} from "../store/actions/auth";
import {formReducer, FORM_INPUT_UPDATE} from '../helpers/ctmReducer'


const FeedbackScreen = (props) => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState()
    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {feedback: ''},
        inputValidities: {feedback: false},
        formIsValid: false
    });

    const inputChangeHandler = useCallback((inputIdentifier, inputValue, inputValidity) => {
        dispatchFormState({
            type: FORM_INPUT_UPDATE,
            value: inputValue,
            isValid: inputValidity,
            input: inputIdentifier
        });

    }, [dispatchFormState])

    const dispatch = useDispatch()
    const sendFeedbackHandler = async () => {
        setError(null)
        setIsLoading(true)

        try {
            await dispatch(sendFeedback(formState.inputValues.feedback, value)) //todo: send feedback to server
            props.navigation.goBack()
        } catch (err) {
            let msg = err.message
            setError(msg)
            setIsLoading(false)
        }

    }

    const [value, setValue] = useState();
    const [placeholder, setPlaceHolder] = useState('')

    useEffect(() => {
        if (value === 'bug') setPlaceHolder('Was hat nicht funktioniert?')
        else if (value === 'feedback') setPlaceHolder('Schreibe uns ein Feedback..')
    }, [value])
    // toDo: find solution for limited feedback


    return (
        <Screen>
            <TextInputAvoidingView>
                <ScrollView contentContainerStyle={styles.inner}>


                    <View style={styles.header}>
                        <Headline>Feedback</Headline>

                    </View>

                    <View style={styles.actions}>
                        <ToggleButton.Row style={{marginVertical: 10, alignSelf: 'flex-start', marginLeft: 43}} onValueChange={value => setValue(value)}
                                          value={value}>
                            <ToggleButton icon="bug" value="bug"/>
                            <ToggleButton icon="star" value="feedback"/>
                        </ToggleButton.Row>
                        <Input mode='outlined' multiline placeholder={placeholder} id='feedback'
                               keyboardType='default' required minLength={4}
                               autocapitalize='none' errorText='' icon='comment-quote'
                               helpText='Du kannst insgesamt drei Mal ein Feedback geben'
                               onInputChange={inputChangeHandler} initialValue=''/>
                        {/*<Input id='password' label='Password' keyboardType='default' required minLength={5}*/}
                        {/*       autocapitalize='none' secureTextEntry errorText='Bitte gebe Dein Passwort ein.'*/}
                        {/*       onInputChange={inputChangeHandler} initialValue=''/>*/}
                    </View>
                    <View style={styles.btnCtn}>
                        <CtmButton loading={isLoading}
                                   mode='contained'
                                   disabled={!formState.formIsValid}
                                   onPress={sendFeedbackHandler}>Senden</CtmButton>
                    </View>
                </ScrollView>
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
        flex: .10,
        justifyContent: 'flex-end',
        marginHorizontal: 10,
        paddingBottom: 30
    },
    action: {
        marginTop: 10,
        width: '100%'
    },
    btnCtn: {
        width: '70%',
        marginTop: 25
    }
})


export default FeedbackScreen

import React, {useContext, useState, useReducer, useCallback, useEffect} from 'react'
import {ScrollView, StyleSheet, KeyboardAvoidingView, View, Platform} from "react-native";
import {Button, Card} from 'react-native-paper'
import {useDispatch} from "react-redux";

import Input from "../components/helper/Input";
import Screen from "../components/wrapper/Screen";
import CtmDialog from "../components/helper/CtmDialog";
import CtmButton from "../components/wrapper/CtmButton";

import * as authActions from '../store/actions/auth'


const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
    if (action.type === FORM_INPUT_UPDATE) {
        const updatedValues = {
            ...state.inputValues,
            [action.input]: action.value
        };
        const updatedValidities = {
            ...state.inputValidities,
            [action.input]: action.isValid
        };
        let updatedFormIsValid = true;
        for (const key in updatedValidities) {
            updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
        }
        return {
            formIsValid: updatedFormIsValid,
            inputValidities: updatedValidities,
            inputValues: updatedValues
        };
    }
    return state;
};


const TextInputAvoidingView = ({children}) => {
    return Platform.OS === 'ios'
        ? (<KeyboardAvoidingView style={styles.wrapper} behavior='padding' keyboardVerticalOffset={80}>
            {children}
        </KeyboardAvoidingView>)
        : <>{children}</>
}

const AuthScreen = props => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState()
    const [visible, setVisible] = useState(false)

    const showDialog = () => setVisible(true);

    const hideDialog = () => setVisible(false);

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: {
            email: '',
            password: ''
        },
        inputValidities: {
            email: false,
            password: false
        },
        formIsValid: false
    });


    useEffect(() => {
        if (error) {
            showDialog()
        }
    },[error])



    const dispatch = useDispatch()
    const signInHandler = async () => {
        let action //

        action = authActions.login(
            formState.inputValues.email,
            formState.inputValues.password
        )
        setError(null)
        setIsLoading(true)
        try {
            dispatch(action)
            props.navigation.navigate('Home')

        } catch (err) {
            setError(err.message)
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
        <Screen style={{alignItems: 'center' , justifyContent:'center'}} >
            <TextInputAvoidingView >
                    <Card style={styles.authCtn}>
                        <ScrollView>
                            <Input id='email' label='E-Mail' keyboardType='email-address' required minLength={4}
                                   autocapitalize='none' errorText='Please enter a valid email adress'
                                   onInputChange={inputChangeHandler} initialValue=''/>
                            <Input id='password' label='Password' keyboardType='default' required minLength={5}
                                   autocapitalize='none' secureTextEntry errorText='Please enter a valid password'
                                   onInputChange={inputChangeHandler} initialValue=''/>
                            <View style={styles.btnCtn}>
                                <CtmButton loading={isLoading}
                                           mode='contained'
                                           disabled=''
                                           onPress={signInHandler}>Teilnehmen</CtmButton>
                            </View>
                        </ScrollView>
                    </Card>
                <CtmDialog visible={visible} showDialog={showDialog} hideDialog={hideDialog} helpText={error}/>
            </TextInputAvoidingView>
        </Screen>

    )

}


const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    authCtn: {
        width: '80%',
        minWidth:300,
        maxWidth: 400,
        maxHeight: 600,
        padding: 15
    },
    btnCtn: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 20

    }

})

export default AuthScreen

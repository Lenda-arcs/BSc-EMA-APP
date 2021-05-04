import React, {useContext, useState, useReducer, useCallback, useEffect, useRef} from 'react'
import {
    Animated,
    StyleSheet,
    View,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    TouchableOpacity
} from "react-native";
import {
    Headline,
    Paragraph,
    withTheme
} from 'react-native-paper'
import {useDispatch, useSelector} from "react-redux";

import Input from "../components/helper/Input";
import Screen from "../components/wrapper/Screen";
import TextInputAvoidingView from "../components/helper/TextInputAvoidingView";
import CtmDialog from "../components/helper/CtmDialog";
import CtmButton from "../components/wrapper/CtmButton";

import * as authActions from '../store/actions/auth'
import {formReducer, FORM_INPUT_UPDATE} from '../helpers/ctmReducer'


const AuthScreen = props => {
    const {colors} = props.theme
    // Transition when Screen visible
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const {isFirstLaunch } = useSelector(state => state.auth)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState()
    const [visible, setVisible] = useState(false)
    const [isSignup, setIsSignup] = useState(isFirstLaunch ? true : false) //todo: if not setSate -> refactor to normal const
    const [inputValues, setInputValues] = useState()
    const [inputValities, setInputValities] = useState()


    const showDialog = () => setVisible(true)
    const hideDialog = () => setVisible(false)


    const fadeIn = () => {
        // Will change fadeAnim value to 0 in 3 seconds
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
        }).start();
    };

    const [formState, dispatchFormState] = useReducer(formReducer, {
        inputValues: inputValues,
        inputValidities: inputValities,
        formIsValid: false
    });

    useEffect(() => {
        fadeIn()
    }, [])

    useEffect(() => {
        isSignup
            ? setInputValues({userId: '', password:'', confirmPassword: ''})
            : setInputValues({userId: '', password: '' })
        isSignup
            ? setInputValities({userId: false, password:false, confirmPassword: false})
            : setInputValities({userId: false, password: false})
    } , [isSignup])



    useEffect(() => {
        if (error) {
            showDialog()
        }
    }, [error])

    const dispatch = useDispatch()
    const authHandler = async () => {
        let action
        if (isSignup) {
            action = authActions.signUser(
                formState.inputValues.userId,
                formState.inputValues.password,
                formState.inputValues.confirmPassword
            )
        } else {
            action = authActions.signUser(
                formState.inputValues.userId,
                formState.inputValues.password
            )
        }


        setError(null)
        setIsLoading(true)
        try {
            await dispatch(action)
        } catch (err) {
            let msg = err.message
            if (msg === 'Error: Password too short') msg = 'Bitte gib Deine Identifikationsnummer und Dein Passwort ein'
            else if (msg === 'Error: Passwords need to be the same') msg = 'Die Passwörter stimmen nicht überein!'
            else if (msg === 'Error: Incorrect userId or password') msg = 'Falsche ID oder Passwort'
            else if (msg.includes('Error: Duplicate field value')) msg = 'Es existiert bereits ein Nutzer mit diesem Namen.'
            else  msg = 'Bitte erneute Eingabe, da ist etwas schiefgegangen!'
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
    }, [dispatchFormState, isSignup])

    return (
        <Screen style={{alignItems: 'center', justifyContent: 'center'}} darkContent noSaveArea>
            <TextInputAvoidingView style={{flex: 1}}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <Animated.View style={{opacity: fadeAnim}}>
                        <ScrollView contentContainerStyle={styles.inner}>
                            <View style={styles.header}>
                                {/*<Headline style={{fontWeight: 'bold'}}>{isSignup ? 'Registieren' : 'Anmelden'}</Headline>*/}
                                    <TouchableOpacity onPress={() => setIsSignup(!isSignup)} style={isSignup ? {borderBottomWidth: 2, borderBottomColor: colors.accent} : styles.selected}>
                                        <Headline style={!isSignup && {fontSize: 13}}>Sign Up</Headline>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setIsSignup(!isSignup)} style={!isSignup ? {borderBottomWidth: 2, borderBottomColor: colors.accent} : styles.selected}>
                                        <Headline style={isSignup && {fontSize: 13}}>Login</Headline>
                                    </TouchableOpacity>
                            </View>
                            <View>
                                <Input id='userId' label='Teilnehmer ID' keyboardType='default' required minLength={4}
                                       userId style={styles.input} icon='account' placeholder='Pilot-XXXX'
                                       helpText='Deine Teilnehmer Identifikationsnummer, die wir Dir mitgeteilt haben.'
                                       autocapitalize='none' errorText='Bitte gebe Deine Teilnehmer Nummer ein.'
                                       onInputChange={inputChangeHandler} initialValue=''/>
                                <Input id='password' label='Password' keyboardType='default' required minLength={8}
                                       style={styles.input} icon='key'
                                       helpText='Gib ein Passwort mit mindestens 8 Zeichen ein.'
                                       autocapitalize='none' secureTextEntry errorText='Mindestens 8 Zeichen'
                                       onInputChange={inputChangeHandler} initialValue=''/>
                                {isSignup &&
                                <Input id='confirmPassword' label='Passwort Bestätigen' keyboardType='default' required
                                       minLength={8}
                                       style={styles.input} icon='key-outline'
                                       helpText='Bestätige Dein Passwort'
                                       autocapitalize='none' secureTextEntry errorText='Die Passwörter müssen übereinstimmen.'
                                       onInputChange={inputChangeHandler} initialValue=''/>}

                            </View>
                            <View style={styles.btnCtn}>
                                <CtmButton loading={isLoading}
                                           mode='contained'
                                           disabled={!formState.formIsValid}
                                           onPress={authHandler}>{isSignup ? 'Sign Up' : 'Login'}</CtmButton>
                            </View>

                            <CtmDialog visible={visible} showDialog={showDialog} hideDialog={hideDialog}
                                       helpText={error}
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
        alignItems: 'center',
        marginHorizontal: 10,
        paddingBottom: 50,
    },
    selected: {fontSize: 5},
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    wrapper: {
        flex: 1
    },
    btnCtn: {
        width: '100%',
        marginTop: 25
    }

})

export default withTheme(AuthScreen)

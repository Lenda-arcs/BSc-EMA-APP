import React, {useEffect} from "react";
import {StyleSheet} from "react-native";

import {ActivityIndicator, withTheme} from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage'
import {useDispatch} from "react-redux";

import Screen from "../components/wrapper/Screen";
import * as authActions from '../store/actions/auth'


const StartupScreen = props => {
    const dispatch = useDispatch()

    // destruct color prop from withTheme
    const {colors} = props.theme




    // checking if first launch for onboarding sequence
    useEffect(() => {
        const isFirstLaunch = async () => {

            const launch = await AsyncStorage.getItem('alreadyLaunched')
             if (!launch) {
                 dispatch(authActions.setIsFirstLaunch(true))
             }
        }
        isFirstLaunch()

    }, [dispatch])


    useEffect(() => {
        const tryLogin = async () => {
            const userData = await AsyncStorage.getItem('userData')

            if (!userData) {
                dispatch(authActions.setDidTryAL())
                return
            }

            const transformedData = JSON.parse(userData)
            const {token, userId, expiryDate} = transformedData

            const expirationDate = new Date(expiryDate)

            if ( expirationDate <= new Date() || !token || !userId){
                dispatch(authActions.setDidTryAL())
                return
            }

            const expirationTime = expirationDate.getTime() - new Date().getTime()

            dispatch(authActions.authenticate(userId, token, expirationTime))
        }

        tryLogin()

    },[dispatch])


    return (
        <Screen style={styles.screen}>
           <ActivityIndicator size='large' color={colors.accent}/>
        </Screen>
    )
}

const styles = StyleSheet.create({

    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default withTheme(StartupScreen)

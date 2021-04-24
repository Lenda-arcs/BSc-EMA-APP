import React, {useEffect} from "react";
import {StyleSheet} from "react-native";

import {ActivityIndicator, withTheme} from "react-native-paper";
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store';
import {useDispatch, useSelector} from "react-redux";

import Screen from "../components/wrapper/Screen";
import {isFirstLaunch, tryLogin} from '../store/actions/auth'


const StartupScreen = props => {
    const dispatch = useDispatch()

    // destruct color prop from withTheme
    const {colors} = props.theme


    useEffect(() => {
        const checkState= async () => {
            await dispatch(isFirstLaunch())
            await dispatch(tryLogin())
        }
        checkState()

    },[])


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

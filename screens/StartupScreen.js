import React, {useEffect} from "react";
import {ActivityIndicator, withTheme} from "react-native-paper";
import {useDispatch} from "react-redux";

import Screen from "../components/wrapper/Screen";
import {isFirstLaunch, tryLogin} from '../store/actions/auth'
import {setUserProgressState, setAssessmentPendingState} from "../store/actions/assessment";


const StartupScreen = props => {
    const {colors} = props.theme
    const dispatch = useDispatch()
    useEffect(() => {
        const checkState = async () => {
            await dispatch(isFirstLaunch())
            await dispatch(tryLogin())
            await dispatch(setUserProgressState())
            await dispatch(setAssessmentPendingState())
        }
        checkState()
    }, [])

    return (
        <Screen
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
            <ActivityIndicator
                size='large'
                color={colors.accent}/>
        </Screen>
    )
}


export default withTheme(StartupScreen)

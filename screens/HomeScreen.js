import React, {useEffect, useRef, useState} from 'react'
import {View, StyleSheet, Vibration, Animated} from 'react-native'
import {withTheme, Paragraph, Snackbar} from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";

import * as Notifications from 'expo-notifications'

import Screen from "../components/wrapper/Screen";
import CtmButton from "../components/wrapper/CtmButton";
import CtmPermission from "../components/helper/CtmPermission";
import StudyOverview from "../components/helper/StudyOverview";

import {getItemAsyncStore} from "../helpers/asyncStoreFactories";
import {getUserProgress, setAssessmentData, setNotifications} from '../store/actions/assessment'
import {calcResTime} from '../helpers/notificationHandler'
import CtmDialog from "../components/helper/CtmDialog";
import CountdownTimer from "../components/helper/CountdownTimer";


Notifications.setNotificationHandler({
    handleNotification: async () => {
        return {
            shouldShowAlert: true,
            shouldSetBadge: true,
            shouldPlaySound: true
        }
    }
})

const HomeScreen = props => {
    const {colors, dark} = props.theme
    const {token, repeatCount} = useSelector(state => state.auth)
    const {userProgress} = useSelector(state => state.assessment)


    const [notificationState, setNotificationState] = useState({not: {}, res: {}}) //todo: handle notifications
    const [access, setAccess] = useState(false)
    const [visible, setVisible] = useState(false)
    const [snackVisible, setSnackVisible] = useState(false)
    const [errText, setErrText] = useState('')
    const [noAccessText, setNoAccessText] = useState('')
    const [slidesFetched, setSlidesFetched] = useState(false)

    const dispatch = useDispatch()
    const isAuth = token

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fadeIn = () => {
        // Will change fadeAnim value to 0 in 3 seconds
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true
        }).start();
    };

    useEffect(() => {
        fadeIn()
        let timeout
        if (userProgress === 0 ) {
            setNoAccessText('Die erste Benachrichtigung kommt morgen.')
            timeout = 8000
        } else {
            setNoAccessText('Du wirst Benachrichtigt wenn es weitergeht.')
            timeout = 2000
        }
        const myTimeout = setTimeout(() => setSnackVisible(true), timeout)
        return () => clearTimeout(myTimeout)
    }, [isAuth])

    useEffect(() => {
        const checkAssessmentCount = async () => {
            try {
                await dispatch(getUserProgress())
            } catch (err) {
                console.log()
            }
        }
        checkAssessmentCount()
    }, [])


    //  Slides!
    useEffect(() => {
        const fetchAssessmentData = async () => {
            try {
                await dispatch(setAssessmentData())
                setSlidesFetched(true)
            } catch (err) {
                setErrText(err.message)
                setVisible(true)
            }
        }
        isAuth && fetchAssessmentData()
    }, [isAuth, dispatch])

    useEffect(() => {
        const scheduleNotification = async () => {
            try {
                await dispatch(setNotifications())
                // Cancel all upcoming notifications when user is finished
                userProgress === repeatCount && await Notifications.cancelAllScheduledNotificationsAsync()
                // const nextDate = await Notifications.getAllScheduledNotificationsAsync()

            } catch (err) {
                console.log(err.message)
                setErrText(err.message)
                setVisible(true)
            }
        }
        slidesFetched && scheduleNotification()
    }, [slidesFetched])

    const _handleNotification = notification => {
        Vibration.vibrate();
        setNotificationState({...notificationState, not: {...notification}});
    };

    const _handleNotificationRes = response => {
        setNotificationState({...notificationState, res: {...response}})
    }


    useEffect(() => {
        if (isAuth) {
            if (notificationState.not.date || notificationState.res.notification) {

                const timePassedAfterTriggered = notificationState.not.date
                    ? calcResTime(notificationState.not.date)
                    : calcResTime(notificationState.res.notification.date)
                // grand access to assessment only within 20min after notification.date
                if (timePassedAfterTriggered < 60 * 20 && userProgress <= repeatCount) setAccess(true) // todo: check if interval too short
            }
        }
    }, [isAuth, notificationState])


    // todo: refactor into own component
    useEffect(() => {
        const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => _handleNotificationRes(response))
        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => _handleNotification(notification))
        // Clear-out function
        return () => {
            foregroundSubscription.remove()
            backgroundSubscription.remove()
        }
    }, [])



    return (

        <Screen>
            <Animated.View style={{flex: 1, justifyContent: 'space-around', alignItems: 'center', opacity: fadeAnim}}>
                <CtmPermission/>
                {isAuth && <StudyOverview style={{flex: .6, marginTop: 40}} colors={colors} count={userProgress} repeats={repeatCount}/>}

                <View style={{backgroundColor: colors.background, ...styles.btnCtn}}>
                    <CtmButton disabled={!access}mode={Platform.OS === 'ios' ? 'outline' : 'contained'} onPress={() => {
                               props.navigation.replace('Assessment')}}>Start</CtmButton>

                </View>
                {/*<CountdownTimer stopTimer={false}/>*/}
            </Animated.View>
            <Snackbar
                style={!dark && {backgroundColor:  colors.accent }}
                visible={snackVisible}
                onDismiss={() => setSnackVisible(!snackVisible)}
                action={{
                    onPress: () => {
                        setSnackVisible(!snackVisible)
                    },
                }}>
                {noAccessText}
            </Snackbar>
            <CtmDialog title='Fehler!' visible={visible} hideDialog={() => setVisible(false)} helpText={errText}/>
        </Screen>


    )
}


const styles = StyleSheet.create({
    btnCtn: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 60,

    }
})

export default withTheme(HomeScreen)

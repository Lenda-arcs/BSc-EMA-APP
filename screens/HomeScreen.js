import React, {useEffect, useRef, useState} from 'react'
import {View, StyleSheet, Vibration, Animated} from 'react-native'
import {withTheme, Paragraph} from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";

import * as Notifications from 'expo-notifications'

import Screen from "../components/wrapper/Screen";
import CtmButton from "../components/wrapper/CtmButton";
import CtmPermission from "../components/helper/CtmPermission";
import StudyOverview from "../components/helper/StudyOverview";

import {checkPushToken} from "../store/actions/auth";
import {getUserProgress, setAssessmentData, setNotifications} from '../store/actions/assessment'
import {calcResTime} from '../helpers/notificationHandler'
import CtmDialog from "../components/helper/CtmDialog";


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
    const {colors} = props.theme
    const {token, repeatCount} = useSelector(state => state.auth)
    const {userProgress} = useSelector(state => state.assessment)


    const [notificationState, setNotificationState] = useState({not: {}, res: {}}) //todo: handle notifications
    const [access, setAccess] = useState(false)
    const [visible, setVisible] = useState(false)
    const [errText, setErrText] = useState('')
    const [noAccessText, setNoAccessText] = useState('Warte auf Deine nächste Benachrichtigung.')
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
        userProgress === 0 && setNoAccessText('Die erste Benachrichtigung kommt morgen.')
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
                if (timePassedAfterTriggered < 60 * 15 && userProgress <= repeatCount) setAccess(true) // todo: check if interval too short
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


    // todo: pushToken not needed?
    useEffect(() => {
        const getPushToken = async () => {
            await dispatch((checkPushToken()))
        }
        getPushToken()

    }, [isAuth])


    return (

        <Screen>
            <Animated.View style={{flex: 1, justifyContent: 'space-around', alignItems: 'center', opacity: fadeAnim}}>
                <CtmPermission/>
                {isAuth && <StudyOverview style={{flex: .6, marginTop: 40}} colors={colors} count={userProgress} repeats={repeatCount}/>}

                <View style={{backgroundColor: colors.background, ...styles.btnCtn}}>
                    {access ? <CtmButton mode={Platform.OS === 'ios' ? 'outline' : 'text'} onPress={() => {
                            props.navigation.replace('Assessment')
                        }}>Start</CtmButton>
                        : <Paragraph style={{fontSize: 16}}>{noAccessText}</Paragraph>}
                </View>
            </Animated.View>
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

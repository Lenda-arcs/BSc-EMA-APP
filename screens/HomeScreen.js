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
import {getAssessmentCount, setAssessmentData, setNotifications} from '../store/actions/assessment'



Notifications.setNotificationHandler({
    handleNotification: async () => {
        return {
            shouldShowAlert: true,
            shouldSetBadge: true,
            shouldPlaySound: false
        }
    }
})

const HomeScreen = props => {
    const {colors} = props.theme
    const isAuth = useSelector(state => state.auth.token)

    const {userProgress, notificationScheduled} = useSelector(state => state.assessment)
    const [notification, setNotification] = useState() //todo: handle notifications


    const dispatch = useDispatch()

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
    },[isAuth])

    //  Slides!
    useEffect(() => {
        const fetchAssessmentData = async () => {
            try {
                await dispatch(setAssessmentData())
            } catch (err) {
                console.log(err.message)
            }
        }
        isAuth && fetchAssessmentData()
    }, [isAuth, dispatch])

    useEffect(() => {
        const scheduleNotification = async () => {
            try {
                await dispatch(setNotifications())
                //await Notifications.cancelAllScheduledNotificationsAsync() // cancel all //todo: do cancellation when user is finished
                const nextDate = await Notifications.getAllScheduledNotificationsAsync()

              //  console.log(nextDate) //todo: testing

            } catch (err) {
                console.log(err.message)
            }
        }
        !notificationScheduled && scheduleNotification()
    }, [])

    const _handleNotification = notification => {
        Vibration.vibrate();
        setNotification({notification});
    };




    // todo: track incoming notification
    useEffect(() => {
        const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response)
        })

        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => _handleNotification(notification))

        // Clear-out function
        return () => {
            foregroundSubscription.remove()
            backgroundSubscription.remove()
        }
    },[])


    // P
    useEffect(() => {
        const getPushToken = async () => {
            await dispatch((checkPushToken()))
        }
        getPushToken()

    }, [isAuth])


    useEffect(() => {
        const checkAssessmentCount = async () => {
            try {
                await dispatch(getAssessmentCount())
            } catch (err) {
                console.log()
            }
        }
        checkAssessmentCount()
    }, [])


    return (

        <Screen>
            <Animated.View style={{flex: 1, justifyContent: 'center', alignItems: 'center', opacity: fadeAnim}}>
                <CtmPermission/>
                {/* todo: show initial welcomeScreen if !isAuth */}
                {isAuth && <StudyOverview colors={colors} count={userProgress}/>}

                {isAuth && userProgress < 30  && (
                    <View style={{backgroundColor: colors.background, ...styles.btnCtn}}>
                        {!notification ? <CtmButton mode={Platform.OS === 'ios' ? 'outline' : 'contained'} onPress={() => {
                                props.navigation.replace('Assessment')
                            }}>Start</CtmButton>
                            : <Paragraph>Hier geht es weiter wenn wir Dich Benachrichtigen</Paragraph>}
                    </View>
                )
                }
            </Animated.View>
        </Screen>


    )
}


const styles = StyleSheet.create({
    btnCtn: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 30,

    },
    image: {
        width: '60%',
        height: '60%',
    }
})

// HomeScreen.whyDidYouRender = true

export default withTheme(HomeScreen)

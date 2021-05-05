import React, {useEffect, useRef, useState} from 'react'
import {View, StyleSheet, Vibration, Animated, Platform} from 'react-native'
import {withTheme, Paragraph, Snackbar, Text, Headline} from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";
import {StackActions, useIsFocused} from '@react-navigation/native'

import * as Notifications from 'expo-notifications'

import Screen from "../components/wrapper/Screen";
import CtmButton from "../components/wrapper/CtmButton";
import StudyOverview from "../components/helper/StudyOverview";

import {
    fetchRestoredAssessment,
    getUserProgress,
    setAssessmentData,
    setNotifications
} from '../store/actions/assessment'
import {filterTimeArr} from '../helpers/notificationHandler'


import CtmDialog from "../components/helper/CtmDialog";
import * as Location from "expo-location";


const HomeScreen = props => {
    const {colors, dark} = props.theme
    const {token, repeatCount, isFirstLaunch, user} = useSelector(state => state.auth)
    const {userProgress, notificationState} = useSelector(state => state.assessment)

    const [access, setAccess] = useState(false)
    const [accessTime, setAccessTime] = useState(0)
    const [scheduledTimeFit, setScheduledTimeFit] = useState(null)
    const [visible, setVisible] = useState(false)
    const [snackVisible, setSnackVisible] = useState(false)
    const [errText, setErrText] = useState('')
    const [noAccessText, setNoAccessText] = useState('')
    const [slidesFetched, setSlidesFetched] = useState(false)

    const dispatch = useDispatch()
    const screenIsFocused = useIsFocused()
    const isAuth = token


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
                await dispatch(fetchRestoredAssessment(token))
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
            } catch (err) {
                // console.log(err.message)
                setErrText(err.message)
                setVisible(true)
            }
        }
        slidesFetched && scheduleNotification() //todo: refactor when times come with user signIn
    }, [slidesFetched])


    useEffect(() => {
        const checkAccess = async () => {
            const accessInSec = await filterTimeArr()
            if (accessInSec.timeLeft >= 0) {
                setAccessTime(accessInSec.timeLeft)
                setScheduledTimeFit(accessInSec.scheduledTime)
            }
        }
        let timeInterval
        if (accessTime <= 0) {
            timeInterval = setInterval(checkAccess, 1000)
        }
        if (timeInterval) return () => clearInterval(timeInterval)
    }, [screenIsFocused, notificationState, accessTime])

    useEffect(() => {
        let myCountdown
        if (accessTime > 0) {
            myCountdown = setTimeout(() => {
                setAccessTime(prevState => prevState - 1)
                if (!access) {
                    setAccess(true)
                }
            }, 1000)
        } else setAccess(false)
        if (myCountdown) return () => clearTimeout(myCountdown)
    }, [accessTime, notificationState])


// todo: make it work better!
    useEffect(() => {
        if (userProgress === 0 && isFirstLaunch) {
            setNoAccessText('Du kannst teilnehmen, sobald eine Benachrichtigung kommt.')
        } else if (userProgress === repeatCount) {
            setNoAccessText('Vielen Dank, dass Du dabei warst!')
        } else if (access) {
            setNoAccessText('Du kannst jetzt an der Befragung teilnehmen.')
        } else {
            setNoAccessText('Du bekommst eine Benachrichtigung wenn es weitergeht.')
        }
        setSnackVisible(true)
    }, [access, userProgress])


    return (

        <Screen>
            <View style={{flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                {isAuth && <StudyOverview style={{marginTop: 40}} colors={colors} userName={user.name}
                                          count={userProgress} repeats={repeatCount}/>}

                <View style={{backgroundColor: colors.background, ...styles.btnCtn}}>
                    {userProgress < repeatCount &&
                        <CtmButton disabled={!access} mode={Platform.OS === 'ios' ? 'outline' : 'contained'}
                                   onPress={() => {
                                       props.navigation.dispatch(StackActions.replace('Assessment', {
                                           scheduledTime: scheduledTimeFit,
                                           startTime: new Date().getTime()
                                       }))
                                   }}>Teilnehmen</CtmButton>}

                    {access && userProgress !== repeatCount ? <Paragraph style={{marginTop: 10}}>Möglich
                        für {(accessTime / 60).toFixed(2)} Minuten</Paragraph> : null}

                </View>
            </View>
            <Snackbar
                style={{backgroundColor: '#35469d'}}
                visible={snackVisible}
                onDismiss={() => setSnackVisible(!snackVisible)}

                action={{
                    label: 'Okay',
                    onPress: () => {
                        setSnackVisible(!snackVisible)
                    },
                }}>
                <Text style={{color: '#fff'}}>{noAccessText}</Text>
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
        marginBottom: 70,

    }
})

export default withTheme(HomeScreen)

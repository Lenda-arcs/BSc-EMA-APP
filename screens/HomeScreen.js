import React, {useEffect, useState} from 'react'
import {View, StyleSheet} from 'react-native'
import {withTheme, Paragraph, Snackbar, Text} from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";
import {StackActions, useIsFocused} from '@react-navigation/native'

import * as Notifications from 'expo-notifications'

import Screen from "../components/wrapper/Screen";
import CtmButton from "../components/wrapper/CtmButton";
import StudyOverview from "../components/helper/StudyOverview";

import {
    fetchRestoredAssessment,
    setAssessmentData,
    setNotifications
} from '../store/actions/assessment'
import {filterTimeArr} from '../helpers/notificationHandler'


import CtmDialog from "../components/helper/CtmDialog";

const studyEnd = 30

const HomeScreen = props => {
    const dispatch = useDispatch()
    const screenIsFocused = useIsFocused()

    const {colors} = props.theme
    const {token, repeatCount, user} = useSelector(state => state.auth)
    const {userProgress, notificationState, pendingAssessment} = useSelector(state => state.assessment)
    const isAuth = token
    const isAdmin = user.role === 'admin'

    const [accessState, setAccessState] = useState({access: false, timeLeft: 0, scheduledTime: null})
    const [dialogState, setDialogState] = useState({visible: false, text: '', title: '', dismissible: true })
    const [snackState, setSnackState] = useState({visible: false, text: ''})
    const [slidesFetched, setSlidesFetched] = useState(false)
    const [pendingFetch, setPendingFetch] = useState(false)
    const validStudyTime = true

    const showDialog = (text) => {
        setDialogState({...dialogState, visible: true, text: text, title: 'Error'})
    }
    const hideDialog = () => {
        setDialogState({...dialogState, visible: false})
    }
    const showSnack = (text) => {
        setSnackState({visible: true, text: text})
    }
    const hideSnack = () => {
        setSnackState({...snackState, visible: false})
    }

    // End of study
    useEffect(() => {
        // conditionally show dialog to prolific success/failure probands
        !dialogState.visible && userProgress == studyEnd && validStudyTime && setDialogState({
            title: 'Teilnahme abgeschlossen',
            visible: true,
            text: <Paragraph style={{lineHeight: 22}}>Der Abschlusscode für Ihre Teilnahme lautet: <Paragraph style={{fontWeight: 'bold', fontSize: 16}}>24E8F247</Paragraph>.{"\n\n"}Alle zukünftigen Benachrichtgungen werden hiermit gelöscht. {"\n\n"}Vielen Dank für Ihre Teilnahme!</Paragraph>,
            dismissible: false
        })

        !dialogState.visible && userProgress == studyEnd && !validStudyTime && setDialogState({
            title: 'Einreichung fehlgeschlagen',
            visible: true,
            text: 'Die durchschnittliche Beantwortungsdauer Ihrer Befragungen ist sehr gering, wir werden die Daten zunächst auf Validität prüfen müssen, bevor Sie den Abschlusscode erhalten können. \n\nSchreiben Sie uns bitte eine Nachricht über das Prolificprotal, um den Abschlusscode bzw. mehr Information zu erhalten. \n\nAlle zukünftigen Benachrichtgungen werden hiermit gelöscht.\n\nVielen Dank für Ihre Teilnahme!',
            dismissible: false
        })

    }, [])

    //  Slides!
    useEffect(() => {
        const getAssessmentData = async () => {
            try {
                await dispatch(setAssessmentData())
                setSlidesFetched(true)
            } catch (err) {
                showDialog(err.message)
            }
        }
        getAssessmentData()
    }, [userProgress])

    useEffect(() => {
        const sendPendingAssessments = async () => {
            setPendingFetch(true)
            try {
                await dispatch(fetchRestoredAssessment(token))
            } catch (err) {
                showDialog(err.message)
            }
            setPendingFetch(false)
        }
        pendingAssessment && sendPendingAssessments()
    }, [pendingAssessment])


    useEffect(() => {
        const scheduleNotification = async () => {
            try {
                await dispatch(setNotifications())
                // Cancel all upcoming notifications when user is finished
                userProgress === repeatCount && await Notifications.cancelAllScheduledNotificationsAsync()
            } catch (err) {
                showDialog(err.message)
            }
        }
        scheduleNotification()
    }, [slidesFetched])


    useEffect(() => {
        const checkAccess = async () => {
            const accessInSec = await filterTimeArr()
            if (accessInSec.timeLeft >= 0) {
                setAccessState(
                    {
                        ...accessState,
                        timeLeft: accessInSec.timeLeft,
                        scheduledTime: accessInSec.scheduledTime
                    })
            }
        }
        let timeInterval
        if (accessState.timeLeft <= 0) {
            timeInterval = setInterval(checkAccess, 1000)
        }
        if (timeInterval) return () => clearInterval(timeInterval)
    }, [screenIsFocused, notificationState, accessState.timeLeft])

    useEffect(() => {
        let myCountdown
        if (accessState.timeLeft > 0) {
            myCountdown = setTimeout(() => {
                setAccessState(
                    (prevState) => {
                        return {...accessState, timeLeft: prevState.timeLeft - 1}
                    })
                if (!accessState.access) {
                    setAccessState({...accessState, access: true})
                }
            }, 1000)
        } else setAccessState({...accessState, access: false})
        if (myCountdown) return () => clearTimeout(myCountdown)
    }, [accessState.timeLeft, notificationState])


// todo: make it work better!
    useEffect(() => {
        let infoText
        if ((userProgress == 0) && !accessState.access) {
            infoText = 'Sie können teilnehmen, sobald eine Benachrichtigung kommt.'
        } else if (userProgress == repeatCount) {
            infoText = 'Vielen Dank für die Teilnahme!'
        } else if (pendingAssessment) {
            infoText = 'Ihre zwischengespeicherten Daten werden an unseren Server gesendet.'
        } else if (accessState.access) {
            infoText = 'Sie können nun an der nächsten Befragung teilnehmen.'
        } else {
            infoText = 'Sie bekommen eine Benachrichtigung, sobald Sie wieder teilnehmen können.'
        }
        showSnack(infoText)
    }, [accessState.access, userProgress])


    return (

        <Screen>
            <View style={styles.container}>
                {
                    isAuth
                    && <StudyOverview style={{marginTop: 40}}
                                      colors={colors}
                                      userName={user.name}
                                      count={userProgress}
                                      repeats={repeatCount}/>
                }

                <View style={{backgroundColor: colors.background, ...styles.btnCtn}}>
                    {
                        !isAdmin && userProgress <= repeatCount
                            ? <CtmButton disabled={!accessState.access || pendingFetch}
                                         mode={'contained'}
                                         onPress={
                                             () => {
                                                 props.navigation.dispatch(StackActions.replace('Assessment',
                                                     {
                                                         scheduledTime: accessState.scheduledTime,
                                                         startTime: new Date().getTime()
                                                     }))
                                             }
                                         }>Teilnehmen</CtmButton>
                            : <CtmButton
                                onPress={() => {
                                    props.navigation.dispatch(StackActions.replace('Assessment',
                                        {scheduledTime: accessState.scheduledTime, startTime: new Date().getTime()}))
                                }}>TESTEN</CtmButton>
                    }

                    {
                        accessState.access && userProgress < repeatCount
                            ? <View style={{marginTop: 10}}>
                                <Paragraph>
                                    Zugang für {Math.floor(accessState.timeLeft / 60) < 10
                                    ? '0'.concat(Math.floor(accessState.timeLeft / 60))
                                    : Math.floor(accessState.timeLeft / 60)}:{
                                    (accessState.timeLeft % 60) < 10
                                        ? '0'.concat(accessState.timeLeft % 60)
                                        : (accessState.timeLeft % 60)} Minuten
                                </Paragraph>
                            </View>
                            : null}

                </View>
            </View>
            <Snackbar
                style={{backgroundColor: '#35469d'}}
                visible={snackState.visible}
                duration={3000}
                onDismiss={hideSnack}
                action={{
                    label: 'x',
                    onPress:  hideSnack ,
                }}>
                <Text style={{color: '#fff'}}>{snackState.text}</Text>
            </Snackbar>
            <CtmDialog
                noHide={!dialogState.dismissible}
                title={dialogState.title}
                visible={dialogState.visible}
                hideDialog={hideDialog}
                helpText={dialogState.text}/>
        </Screen>


    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    btnCtn: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 70,

    }
})

export default withTheme(HomeScreen)

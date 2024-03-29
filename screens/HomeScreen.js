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
    setNotifications,
    fetchAssessmentStats
} from '../store/actions/assessment'
import {filterTimeArr} from '../helpers/notificationHandler'


import CtmDialog from "../components/helper/CtmDialog";


const HomeScreen = props => {
    const dispatch = useDispatch()
    const screenIsFocused = useIsFocused()

    const {colors} = props.theme
    const {token, repeatCount, user} = useSelector(state => state.auth)
    const {userProgress, notificationState, pendingAssessment, validAssessments} = useSelector(state => state.assessment)
    const isAuth = token
    const isAdmin = user.role === 'admin'

    const [accessState, setAccessState] = useState({access: false, timeLeft: 0, scheduledTime: null})
    const [dialogState, setDialogState] = useState({visible: false, text: '', title: '', dismissible: true })
    const [snackState, setSnackState] = useState({visible: false, text: ''})
    const [pendingFetch, setPendingFetch] = useState(false)


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
        // const checkDataQuality = async () => {
        //     await dispatch(fetchAssessmentStats())
        // }
        if (true) {
            setDialogState({
                title: 'Studienzeit abgelaufen',
                visible: true,
                text: 'Die iViewSky Studie ist nun abgeschlossen. Es ist ab sofort nicht mehr möglich an einer Befragung teilzunehmen. Bei Fragen wenden Sie sich bitte an den Studienleiter. Vielen Dank für Ihre Teilnahme!',
                dismissible: false
            })
        }
        // if (userProgress >= repeatCount && !isAdmin) {
        //     checkDataQuality()
        //
        //     if (validAssessments == true) {
        //         setDialogState({
        //             title: 'Teilnahme abgeschlossen',
        //             visible: true,
        //             text: <Paragraph style={{lineHeight: 22}}>Der Abschlusscode für Ihre Teilnahme lautet: <Text style={{fontWeight: 'bold', fontSize: 16}}>24E8F247</Text>. Schreiben Sie uns eine Nachricht inklusive Abschlusscode über das Prolific Portal.{"\n\n"}Sind Sie ein Student der UHH und möchten <Text style={{fontWeight: 'bold'}}>VP-Stunden</Text>? Dann schreiben Sie uns eine E-Mail (siehe Studienbeschreibung), mit Betreff "iViewSky_VP-Stunden_24E8F247" und als Anhang das ausgefüllte VP-Stunden Formular. {"\n\n"}Alle zukünftigen Benachrichtgungen werden hiermit gelöscht. {"\n\n"}Vielen Dank für Ihre Teilnahme an dieser Untersuchung!</Paragraph>,
        //             dismissible: false
        //         })
        //     } else {
        //         setDialogState({
        //             title: 'Einreichung fehlgeschlagen',
        //             visible: true,
        //             text: 'Die durchschnittliche Bearbeitungszeit die Sie für die Befragungen benötigt haben unterschreitet den Grenzwert, wir werden die Daten zunächst prüfen müssen, bevor Sie Ihren Abschlusscode erhalten können. \n\nSchreiben Sie uns bitte eine Nachricht über das Prolific Portal, um den Abschlusscode bzw. mehr Information zu erhalten. Als Student der UHH, schreiben Sie uns eine E-Mail (siehe Studienbeschreibung). \n\nAlle zukünftigen Benachrichtgungen sind hiermit gelöscht.\n\nVielen Dank für Ihre Teilnahme an dieser Untersuchung!',
        //             dismissible: false
        //         })
        //     }
        // }
    }, [userProgress, validAssessments])

    //  Slides!
    useEffect(() => {
        const getAssessmentData = async () => {
            try {
                await dispatch(setAssessmentData())
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
                userProgress >= repeatCount && await Notifications.cancelAllScheduledNotificationsAsync()
            } catch (err) {
                showDialog(err.message)
            }
        }
        scheduleNotification()
    }, [])


    useEffect(() => {
        const checkAccess = async () => {
            const accessInSec = await filterTimeArr(notificationState)
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
            infoText = 'Ihre zwischengespeicherten Daten versendet.'
        } else if (accessState.access) {
            infoText = 'Sie können nun an der Befragung teilnehmen.'
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

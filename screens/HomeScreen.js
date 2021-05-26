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

const HomeScreen = props => {
    const dispatch = useDispatch()
    const screenIsFocused = useIsFocused()

    const {colors} = props.theme
    const {token, repeatCount, isFirstLaunch, user} = useSelector(state => state.auth)
    const {userProgress, notificationState, pendingAssessment} = useSelector(state => state.assessment)
    const isAuth = token
    const isAdmin = user.role === 'admin'

    const [accessState, setAccessState] = useState({access: false, timeLeft: 0, scheduledTime: null})
    const [dialogState, setDialogState] = useState({visible: false, text: '', title: ''})
    const [snackState, setSnackState] = useState({visible: false, text: ''})
    const [slidesFetched, setSlidesFetched] = useState(false)
    const [pendingFetch, setPendingFetch] = useState(false)

    const showDialog = (text) => {
        setDialogState({visible: true, text: text, title: 'Error'})
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

    // // End of pilot study //todo: delete with reals study
    // useEffect(() => {
    //     !dialogState.visible && setDialogState({
    //         title: 'Ende der Pilot Studie',
    //         visible: true,
    //         text: 'Danke, dass Du dabei warst! Die Testphase ist jetzt beendet. Bitte teile dein Feedback mit mir! \n\nAlle zukünftigen Benachrichtgungen sind hiermit gelöscht.'
    //     })
    // }, [])

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
        slidesFetched && scheduleNotification() //todo: refactor when times come with user signIn
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
            infoText = 'Du kannst teilnehmen, sobald eine Benachrichtigung kommt.'
        } else if (userProgress == repeatCount) {
            infoText = 'Vielen Dank, dass Du dabei warst!'
        } else if (pendingAssessment) {
            infoText = 'Veruche Deine letzte Fehlgeschlagende Befragung abzuschicken'
        } else if (accessState.access) {
            infoText = 'Du kannst jetzt an der Befragung teilnehmen.'
        } else {
            infoText = 'Du bekommst eine Benachrichtigung, wenn es weitergeht.'
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
                    label: '   ',
                    onPress:  hideSnack ,
                }}>
                <Text style={{color: '#fff'}}>{snackState.text}</Text>
            </Snackbar>
            <CtmDialog
                //noHide // non dismissible dialog to end the current study
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

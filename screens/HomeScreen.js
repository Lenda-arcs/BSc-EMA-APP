import React, {useCallback, useEffect, useState} from 'react'
import {View, StyleSheet} from 'react-native'
import {useDispatch, useSelector} from "react-redux";
import {useFocusEffect} from '@react-navigation/native';


import * as Notifications from 'expo-notifications'

import AsyncStorage from "@react-native-async-storage/async-storage";

import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {withTheme, Paragraph, Text} from "react-native-paper";


import Screen from "../components/wrapper/Screen";
import CtmSubheading from "../components/wrapper/CtmSubheading";
import CtmButton from "../components/wrapper/CtmButton";


import * as authActions from "../store/actions/auth";
import * as assessmentActions from '../store/actions/assessment'
import CtmPermission from "../components/helper/CtmPermission";
import ENV from "../ENV";
import {ASSESSMENT_COUNT} from "../store/actions/assessment";

const testData = {
    "name": "test-slide",
    "questions": {
        "id" : "1",
        "text": "...."
    }
}

const StudyOverview = ({count, colors}) => {

    const [fill, setFill] = useState(0)

    useEffect(() => {
        setFill(count / 30 * 100)
    }, [count])

    return (
        <View style={{backgroundColor: colors.background, marginTop: 60}}>
            <CtmSubheading style={{textAlign: 'center', marginBottom: 40}}>Willkommen!</CtmSubheading>
            <AnimatedCircularProgress
                size={250}
                width={10}
                arcSweepAngle={270}
                rotation={225}
                lineCap="round"
                fill={fill}
                tintColor={colors.accent}
                backgroundColor='#fff'>
                {
                    useCallback((fill) => (
                        <Paragraph>
                            {count} von 30

                        </Paragraph>
                    ), [count])
                }
            </AnimatedCircularProgress>
        </View>
    )
}


let sendTime;
let responseTime;

const HomeScreen = props => {
    const isAuth = useSelector(state => state.auth.token)

    const userProgress = useSelector(state => state.assessments.assessmentCount)
    const [promptRes, setPromptRes] = useState(true)



    const dispatch = useDispatch()
    const {colors} = props.theme

    // todo: if not needed - delete
    const [isLoading, setIsLoading] = useState(false)


    //  WORKING!
    useEffect(() => {
        isAuth && dispatch(assessmentActions.setAssessmentData())

    },[isAuth, dispatch])



    // todo: track incoming notification
    useEffect(() => {
        const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            setPromptRes(!promptRes)
            console.log('response')
            // console.log(response)
            responseTime = response.notification.date
            console.log(responseTime)

        })

        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {

            console.log('notification')
            sendTime = notification.date
            console.log(sendTime)

        })

        // Clear-out function
        return () => {
            foregroundSubscription.remove()
            backgroundSubscription.remove()
        }
    }, [])




    useEffect(() => {
        const sendPushToken = async () => {
            const pushToken = await AsyncStorage.getItem('hasPushToken')
            console.log(pushToken)

            if (!pushToken) {
                dispatch(authActions.getUserPushToken())
            }
            else console.log('hasToken')
        }
        sendPushToken()


    }, [isAuth])

    useEffect(() => {
        const getAssessmentCount = async () => {
            try {
                await dispatch(assessmentActions.getAssessmentCount())
            } catch (err) {
                console.log()
            }
        }
        getAssessmentCount()
    },[])

    // useFocusEffect(() => {
    //         let isActive = true
    //
    //
    //         return () => isActive = false
    //     })

    return (

        <Screen>
            <View style={{flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>

                {/* todo: show initial welcomeScreen if !isAuth */}
                {isAuth ? <StudyOverview colors={colors} count={userProgress}/> : <CtmPermission/>}

                <View style={{backgroundColor: colors.background, ...styles.btnCtn}}>
                    {isAuth && promptRes ? <CtmButton mode='contained' onPress={() => {
                            props.navigation.replace('Assessment')
                        }}>Start</CtmButton>
                        : <Paragraph>Hier geht es weiter wenn wir Dich Benachrichtigen</Paragraph>}
                    {/*<CtmButton mode='contained' onPress={() => {*/}
                    {/*    props.navigation.replace('Assessment', {*/}
                    {/*        studyCount: userProgress*/}
                    {/*    })*/}
                    {/*}}>Start</CtmButton>*/}
                </View>
            </View>

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
        width: '100%',
        height: '100%',
    }
})

// HomeScreen.whyDidYouRender = true

export default withTheme(HomeScreen)

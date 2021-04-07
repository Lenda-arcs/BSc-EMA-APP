import React, {useCallback, useEffect, useState} from 'react'
import {View, StyleSheet, Image} from 'react-native'
import {useDispatch, useSelector} from "react-redux";


import * as Notifications from 'expo-notifications'


import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {withTheme, Paragraph, Text ,Headline} from "react-native-paper";


import Screen from "../components/wrapper/Screen";
import CtmSubheading from "../components/wrapper/CtmSubheading";
import CtmButton from "../components/wrapper/CtmButton";


import {checkPushToken} from "../store/actions/auth";
import {getAssessmentCount, setAssessmentData} from '../store/actions/assessment'
import CtmPermission from "../components/helper/CtmPermission";

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
            <CtmSubheading style={{textAlign: 'center', marginBottom: 40}}>Willkommen bei der Studie!</CtmSubheading>
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

                        <Headline>
                            {count}

                        </Headline>
                           // <Image style={styles.image} source={require('./../assets/icon.png')}/>

                    ), [count])
                }
            </AnimatedCircularProgress>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 40, marginTop: -20}}>
                <Text>0</Text>
                <Text>30</Text>
            </View>
        </View>
    )
}


let sendTime;
let responseTime;

const HomeScreen = props => {
    const {colors} = props.theme
    const isAuth = useSelector(state => state.auth.token)

    const userProgress = useSelector(state => state.assessments.assessmentCount)
    const [notification, setNotification] = useState(true) //todo: handle notifications


    const dispatch = useDispatch()


    //  Slides!
    useEffect(() => {
        const fetchAssessmentData = async () => {
            try {
                await dispatch(setAssessmentData())
            }catch (err) {
                console.log(err.message)
            }
        }
        isAuth && fetchAssessmentData()
    },[isAuth, dispatch])



    // todo: track incoming notification
    useEffect(() => {
        const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            setNotification(!notification)
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
    },[])


    return (

        <Screen>
            <View style={{flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                <CtmPermission/>
                {/* todo: show initial welcomeScreen if !isAuth */}
                {isAuth && <StudyOverview colors={colors} count={userProgress}/>}

                {isAuth && (
                        <View style={{backgroundColor: colors.background, ...styles.btnCtn}}>
                            {notification ? <CtmButton mode='contained' onPress={() => {
                                    props.navigation.replace('Assessment')
                                }}>Start</CtmButton>
                                : <Paragraph>Hier geht es weiter wenn wir Dich Benachrichtigen</Paragraph>}
                        </View>
                    )
                }
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
        width: '60%',
        height: '60%',
    }
})

// HomeScreen.whyDidYouRender = true

export default withTheme(HomeScreen)

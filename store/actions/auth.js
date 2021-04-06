import ENV from "../../ENV";
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import * as Permissions from "expo-permissions";
import {Alert} from "react-native";

import * as assessmentActions from './assessment'
export const AUTHENTICATE = 'AUTHENTICATE'
export const LOGOUT = 'LOGOUT'
export const SET_DID_TRY_AL = 'SET_DID_TRY_AL'
export const SET_IS_FIRST_LAUNCH = 'SET_IS_FIRST_LAUNCH'
export const INC_ASSESSMENT_COUNT = 'INC_ASSESSMENT_COUNT'

let timer;


export const getUserPushToken = () => {
    let pushToken

    return async (dispatch) => {

        let notificationStatusObj = await Permissions.getAsync(Permissions.NOTIFICATIONS)
        if (notificationStatusObj.status !== 'granted') {
            notificationStatusObj = await Permissions.askAsync(Permissions.NOTIFICATIONS)
        }
        if (notificationStatusObj.status !== 'granted') {
            Alert.alert('Insufficient permissions!', 'You need to grand permissions to use notifications for this app',
                [{text: 'Okay'}])
            pushToken = null
        } else {
            // generate pushToken for Notifications
            // resolve promise and store data in variable
            pushToken = (await Notifications.getExpoPushTokenAsync()).data


            dispatch(sendPushToken(pushToken))
        }
    }

}

const sendPushToken = (pushToken) => {
    return async (dispatch, getState) => {
        const {token, userId} = getState().auth


        if (token) {
            const tokenResponse = await fetch(`${ENV.TempOwnApi}/users/${userId[1]}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization" : `Bearer ${token}`
                },
                body: JSON.stringify({
                    pushToken: pushToken
                })
            })

            const tokenResData = await tokenResponse.json()
            if (tokenResData) await AsyncStorage.setItem('hasPushToken', 'true')

        }

    }
}


export const authenticate = (userId, token, group, expiryTime) => {
    return dispatch => {
        //dispatch(setLogoutTimer(expiryTime))
        dispatch({
            type: AUTHENTICATE,
            userId: userId,
            token: token,
            group: group

        })
    }

}

export const setDidTryAL = () => {
    return {type: SET_DID_TRY_AL}
}


export const setIsFirstLaunch = (bool) => {
    return async (dispatch) => {

        // Saving item to storage for further validation
        try {
            await AsyncStorage.setItem('alreadyLaunched', 'true')
        } catch (e) {
            throw new Error('Saving first launch to AsyncStorage failed!')
        }

        dispatch({type: SET_IS_FIRST_LAUNCH, val: bool})
    }

}
export const login = (email, password) => {
    return async (dispatch) => {


        const response = await fetch(`${ENV.TempOwnApi}/users/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: email,
                    password: password
                })
            })

       // todo: needs help
        console.log("status: " + response.ok)
        if (!response.ok) {
            const errorResData = await response.json();
            const errorId = errorResData.message;
            let message = 'Something went wrong!';
            if (errorId === 'EMAIL_EXISTS') {
                message = 'This email exists already!';
            }
            throw new Error(errorId);

        }

        const resData = await response.json()


        // for later db patching
        const userId = [resData.data.user.userId, resData.data.user.id]
        const userToken = resData.token
        const userGroup = resData.data.user.group
        const userAssessmentCount = resData.data.user.assessmentCount

        dispatch(
            authenticate(
                userId,
                userToken,
                userGroup
                //parseInt(resData.expiresIn) * 1000
            )
        )
        dispatch(assessmentActions.setAssessmentCount(userAssessmentCount))
        //
        // // Calc authToken expiration time
        // const expirationDate = new Date(new Date().getTime() + parseInt(resData.expiresIn) * 1000)
        //
        await saveUserToStorage(userToken, userId, userGroup)


    }
}

export const logout = () => {
    clearLogoutTimer()
    AsyncStorage.removeItem('userData')
    return {type: LOGOUT}
}

const clearLogoutTimer = () => {
    if (timer) clearTimeout(timer)
}

// if needed in production --> refactor to react-native-background-timer
const setLogoutTimer = expirationTime => {
    return dispatch => {
        timer = setTimeout(() => {
            dispatch(logout())
        }, expirationTime)
    }
}


const saveUserToStorage = async (token, userId, group, expiryDate) => {
    await AsyncStorage.setItem('userData', JSON.stringify({
        token: token,
        userId: userId,
        group: group
       // expiryDate: expiryDate.toISOString()
    }))
}


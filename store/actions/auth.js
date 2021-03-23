import ENV from "../../ENV";
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import * as Permissions from "expo-permissions";
import {Alert} from "react-native";

export const AUTHENTICATE = 'AUTHENTICATE'
export const LOGOUT = 'LOGOUT'
export const SET_DID_TRY_AL = 'SET_DID_TRY_AL'
export const SET_IS_FIRST_LAUNCH = 'SET_IS_FIRST_LAUNCH'
export const SET_PUSH_TOKEN = 'SET_PUSH_TOKEN'

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

const sendPushToken = (token) => {
    return async (dispatch, getState) => {
        const userToken = getState().auth.token

        if (userToken) {
            const tokenResponse = await fetch(`https://mybsc-ema-default-rtdb.firebaseio.com/token/.json?auth=${userToken}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/.json'
                },
                body: JSON.stringify(token)
            })

            const tokenResData = await tokenResponse.json()
            if (tokenResData) await AsyncStorage.setItem('hasPushToken', 'true')

        }

    }
}


export const authenticate = (userId, token, expiryTime) => {
    return dispatch => {
        dispatch(setLogoutTimer(expiryTime))
        dispatch({
            type: AUTHENTICATE,
            userId: userId,
            token: token
        })
    }

}

export const setDidTryAL = () => {
    return {type: SET_DID_TRY_AL}
}


export const setIsFirstLaunch = (bool) => {
        return ({type: SET_IS_FIRST_LAUNCH, val: bool})
}
export const login = (email, password) => {
    return async (dispatch) => {

        const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${ENV.authGoogleApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    returnSecureToken: true
                })
            })
        if (!response.ok) {
            const errorResData = await response.json()
            const errorId = errorResData.error.message
            console.log(errorId)
            let msg = 'Something went wrong!'
            if (errorId === 'EMAIL_NOT_FOUND') {
                msg = 'This email could not be found!'
            } else if (errorId === 'INVALID_PASSWORD') {
                msg = 'The entered password is not valid'
            }
            throw new Error(msg)
        }
        const resData = await response.json()
        //console.log(resData)

        dispatch(
            authenticate(
                resData.localId,
                resData.idToken,
                parseInt(resData.expiresIn) * 1000)
        )

        // Calc authToken expiration time
        const expirationDate = new Date(new Date().getTime() + parseInt(resData.expiresIn) * 1000)

        saveTokenToStorage(resData.idToken, resData.localId, expirationDate)

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


const saveTokenToStorage = (token, userId, expiryDate) => {
    AsyncStorage.setItem('userData', JSON.stringify({
        token: token,
        userId: userId,
        expiryDate: expiryDate.toISOString()
    }))
}
const savePushTokenToStorage = () => {

}

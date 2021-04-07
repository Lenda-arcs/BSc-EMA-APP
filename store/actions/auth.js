import ENV from "../../ENV";
import * as Notifications from 'expo-notifications'
import * as Permissions from "expo-permissions";

import {Alert} from "react-native";

import * as assessmentActions from './assessment'
import * as storeFac from './../../helpers/storeFactories'

export const AUTHENTICATE = 'AUTHENTICATE'
export const LOGOUT = 'LOGOUT'
export const SET_DID_TRY_AL = 'SET_DID_TRY_AL'
export const SET_IS_FIRST_LAUNCH = 'SET_IS_FIRST_LAUNCH'
export const SET_PUSH_TOKEN = 'SET_PUSH_TOKEN'
export const SET_FINISHED_BOARDING = 'SET_FINISHED_BOARDING'

let USER = 'USER_DATA'
const LAUNCHED = 'LAUNCHED'
const PUSH_TOKEN = 'PUSH_TOKEN'


export const checkPushToken = () => {
    return async () => {
        const asyncRes = await storeFac.getItemAsyncStore(PUSH_TOKEN)
        if (!asyncRes) {
            const pushToken = await getUserPushToken()
            await storeFac.saveItemAsyncStore(PUSH_TOKEN, true)
            await sendPushToken(pushToken)
        }
    }
}

const getUserPushToken = async () => {
    let pushToken

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
    }
    return pushToken
}


const sendPushToken = (pushToken) => {
    return async (dispatch, getState) => {
        const {token, userId} = getState().auth
        if (token) {
            try {
                const tokenRes = await storeFac.fetchData(`${ENV.TempOwnApi}/users/${userId[1]}`,
                    'PATCH',
                    {pushToken: pushToken}, token)
            } catch (err) {
                throw new Error(err)
            }
        }
    }
}


export const authenticate = (user) => {
    return dispatch => {
        //dispatch(setLogoutTimer(expiryTime))

        // todo: is token in redux state save?
        dispatch({
            type: AUTHENTICATE,
            token: user.token,
            userId: user.userId,
            group: user.group
        })
    }
}

export const setDidTryAL = () => {
    return {type: SET_DID_TRY_AL}
}

/// todo: NEEDS FURTHER REDO!!
export const tryLogin = () => {
    return async (dispatch) => {
        const userData = await storeFac.getItemAsyncStore(USER, true)

        if (!userData) {
            dispatch(setDidTryAL())
            return
        }
        const transformedData = JSON.parse(userData)
        const {token, userId, group} = transformedData

        dispatch(authenticate({token, userId, group}))
    }
}

export const isFirstLaunch = () => {
    return async (dispatch) => {
        const isLaunched = await storeFac.getItemAsyncStore(LAUNCHED)
        if (!isLaunched) {
            await storeFac.saveItemAsyncStore(LAUNCHED, true)
            dispatch({type: SET_IS_FIRST_LAUNCH, val: true})
        } else dispatch({type: SET_IS_FIRST_LAUNCH, val: false})
    }

}

export const finishBoarding = () => {
    return {type: SET_FINISHED_BOARDING}
}

// user login
export const login = (userId, password) => {
    return async (dispatch) => {
        try {
            const resData = await storeFac.fetchData(`${ENV.TempOwnApi}/users/login`, 'POST', {userId, password})
            // for later db patching
            const user = {
                token: resData.token,
                userId: [resData.data.user.userId, resData.data.user.id],
                group: resData.data.user.group
            }

            // specific key for async storage ?? -- find way to reuse it for later actions
            // USER = USER.concat(user.userId[0])

            const userAssessmentCount = resData.data.user.assessmentCount

            dispatch(authenticate(user))
            dispatch(assessmentActions.setAssessmentCount(userAssessmentCount))

            // old:  await saveUserToStorage(userToken, userId, userGroup)
            await storeFac.saveItemAsyncStore(USER, user, true)
        } catch (err) {

            throw new Error(err)
        }

    }
}
export const logout = () => {
    //clearLogoutTimer()
    return async (dispatch) => {
        await storeFac.deleteItemAsyncStore(USER, true)
        dispatch({type: LOGOUT})
    }
}


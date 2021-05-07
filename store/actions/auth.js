import ENV from "../../env";
import * as Device from 'expo-device';

import * as assessmentActions from './assessment'
import * as storeFac from '../../helpers/asyncStoreFactories'
import {fetchData} from '../../helpers/fetchFactories'
import {saveItemAsyncStore, getItemAsyncStore, deleteItemAsyncStore} from "../../helpers/asyncStoreFactories";
import {osName} from "expo-device";


export const AUTHENTICATE = 'AUTHENTICATE'
export const LOGOUT = 'LOGOUT'
export const SET_DID_TRY_AL = 'SET_DID_TRY_AL'
export const SET_IS_FIRST_LAUNCH = 'SET_IS_FIRST_LAUNCH'
export const SET_FEEDBACK = 'SET_FEEDBACK'
export const NOTIFICATION_TIMES = 'NOTIFICATION_TIMES'

const USER = 'USER_DATA'
const LAUNCHED = 'LAUNCHED'


export const sendFeedback = (message, topic) => {
    return async (dispatch, getState) => {


        const feedbackCount = await getItemAsyncStore(SET_FEEDBACK, undefined, undefined)
        const {token, user} = getState().auth
        const newFeedback = {
            user: user.id[1],
            feedback: {
                topic: topic,
                text: message,
                rating: 0
            }
        }
        if (token) {
            try {
                if (!feedbackCount || feedbackCount <= 3) {
                    await fetchData(`${ENV.OwnApi}/feedback`, 'POST', newFeedback, token)
                    const newFeedbackCount = +feedbackCount + 1
                    await saveItemAsyncStore(SET_FEEDBACK, newFeedbackCount)
                    dispatch({type: SET_FEEDBACK})
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    }
}


export const authenticate = (auth) => {
    return dispatch => {
        //dispatch(setLogoutTimer(expiryTime))

        // todo: is token in redux state save?
        dispatch({
            type: AUTHENTICATE,
            token: auth.token,
            user: auth.user,
            repeats: auth.repeatCount
        })
    }
}

export const setDidTryAL = () => {
    return {type: SET_DID_TRY_AL}
}

export const tryLogin = () => {
    return async (dispatch) => {
        const userData = await storeFac.getItemAsyncStore(USER, true, true)
        if (!userData || !userData?.user?.name) {
            await storeFac.deleteItemAsyncStore(USER, true)
            dispatch(setDidTryAL())
            return
        }
        const {token, user, repeatCount} = userData


        dispatch(authenticate({token, user, repeatCount}))
    }
}

export const isFirstLaunch = () => {
    return async (dispatch) => {
        const isLaunched = await storeFac.getItemAsyncStore(LAUNCHED)
        if (!isLaunched) {
            dispatch({type: SET_IS_FIRST_LAUNCH, val: true})
        } else dispatch({type: SET_IS_FIRST_LAUNCH, val: false})

    }

}
// user login and signup
export const signUser = (userId, password, passwordConfirm = null) => {
    let type = !passwordConfirm ? 'login' : 'signup'
    let data = !passwordConfirm ? {userId, password} : {userId, password, passwordConfirm}
    // get user device data
    if(passwordConfirm) data.device = {type: Device.brand, os: Device.osName, osVersion: Device.osVersion}
    return async (dispatch) => {
        try {
            const resData = await fetchData(`${ENV.OwnApi}/users/${type}`, 'POST', data)
            // for later db patching
            const auth = {
                token: resData.token,
                user: {
                    name: resData.data.user.userId,
                    id: resData.data.user.id,
                    group: resData.data.user.group,
                    role: resData.data.user.role
                },
                repeatCount: resData.data.user.assessmentRepeats
            }
            const notificationTimes = resData.data.user.notificationTimes


            const userProgress = resData.data.user.userProgress

            dispatch(authenticate(auth))
            dispatch(assessmentActions.setUserProgress(userProgress))

            // only set fistLaunch complete if registration was successful
            await storeFac.saveItemAsyncStore(LAUNCHED, true)
            await storeFac.saveItemAsyncStore(USER, auth, true)
            if (notificationTimes.length > 0) await storeFac.saveItemAsyncStore(NOTIFICATION_TIMES, notificationTimes)
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


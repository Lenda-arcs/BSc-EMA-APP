import ENV from "../../env";

import * as assessmentActions from './assessment'
import * as storeFac from '../../helpers/asyncStoreFactories'
import {fetchData} from '../../helpers/fetchFactories'
import {saveItemAsyncStore, getItemAsyncStore, deleteItemAsyncStore} from "../../helpers/asyncStoreFactories";


export const AUTHENTICATE = 'AUTHENTICATE'
export const LOGOUT = 'LOGOUT'
export const SET_DID_TRY_AL = 'SET_DID_TRY_AL'
export const SET_IS_FIRST_LAUNCH = 'SET_IS_FIRST_LAUNCH'
export const SET_FEEDBACK = 'SET_FEEDBACK'

let USER = 'USER_DATA'
const LAUNCHED = 'LAUNCHED'


export const sendFeedback = (message, topic) => {
    return async (dispatch, getState) => {


        const feedbackCount = await getItemAsyncStore(SET_FEEDBACK, undefined, undefined)
        const {token, userId} = getState().auth
        const newFeedback = {
            user: userId[1],
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


export const authenticate = (user) => {
    return dispatch => {
        //dispatch(setLogoutTimer(expiryTime))

        // todo: is token in redux state save?
        dispatch({
            type: AUTHENTICATE,
            token: user.token,
            userId: user.userId,
            group: user.group,
            repeats: user.repeatCount
        })
    }
}

export const setDidTryAL = () => {
    return {type: SET_DID_TRY_AL}
}

export const tryLogin = () => {
    return async (dispatch) => {
        const userData = await storeFac.getItemAsyncStore(USER, true, true)
        if (!userData) {
            dispatch(setDidTryAL())
            return
        }
        const {token, userId, group, repeatCount} = userData

        dispatch(authenticate({token, userId, group, repeatCount}))
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
    return async (dispatch) => {
        try {
            const resData = await fetchData(`${ENV.OwnApi}/users/${type}`, 'POST', data)
            // for later db patching
            const user = {
                token: resData.token,
                userId: [resData.data.user.userId, resData.data.user.id],
                group: resData.data.user.group,
                repeatCount: resData.data.user.assessmentRepeats
            }

            const userProgress= resData.data.user.userProgress

            dispatch(authenticate(user))
            dispatch(assessmentActions.setUserProgress(userProgress))

            // only set fistLaunch complete if registration was successful
            passwordConfirm && await storeFac.saveItemAsyncStore(LAUNCHED, true)
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


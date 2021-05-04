import * as Network from 'expo-network'
import {Platform} from "react-native";

import ENV from '../../env'
import Assessment from "../../models/assessment";
import * as storeFac from '../../helpers/asyncStoreFactories'
import {fetchData} from '../../helpers/fetchFactories'
import {scheduleNotificationHandler, checkNotificationPermission} from '../../helpers/notificationHandler'
import {getUserLocation} from "../../helpers/permissonFactories";
import {getItemAsyncStore, saveItemAsyncStore, deleteItemAsyncStore} from "../../helpers/asyncStoreFactories";

import {Buffer} from "buffer";


export const SET_USER_PROGRESS = 'SET_USER_PROGRESS'
export const SET_ASSESSMENT_DATA = 'SET_ASSESSMENT_DATA'
export const SET_NOTIFICATION_SCHEDULED = 'SET_NOTIFICATION_SCHEDULED'
export const ASSESSMENT_PENDING = 'ASSESSMENT_PENDING'


export const USER_PROGRESS = 'USER_PROGRESS'
export const ASSESSMENT_DATA = 'ASSESSMENT_DATA'
export const NOTIFICATION_TIMES = 'NOTIFICATION_TIMES'
export const SET_NOTIFICATION_STATE = 'SET_NOTIFICATION_STATE'


export const removeScheduledTime = (time) => {
    return async () => {
        const dates = await getItemAsyncStore(NOTIFICATION_TIMES, undefined, true)
        if (dates) {
            const index = dates.indexOf(time)
            if (index > -1) {
                dates.splice(index, 1)
                const newDates = await saveItemAsyncStore(NOTIFICATION_TIMES, dates)

            }
        }
    }
}

export const setNotificationState = (state) => {
    return dispatch => {
        dispatch({type: SET_NOTIFICATION_STATE, val: state})
    }
}

export const setAssessmentData = () => {
    return async (dispatch, getState) => {
        const {token, repeatCount} = getState().auth

        let slideData
        let notificationTimes = []

        const asyncStoreSlides = await storeFac.getItemAsyncStore(ASSESSMENT_DATA, false, true)

        if (!asyncStoreSlides) {
            if ((await Network.getNetworkStateAsync()).isInternetReachable) {
                slideData = await fetchData(`${ENV.OwnApi}/slides`, 'GET', null, token)
                notificationTimes = slideData.attachment //todo: refactor
                slideData = slideData.data.data

                await storeFac.saveItemAsyncStore(ASSESSMENT_DATA, slideData)
                await storeFac.saveItemAsyncStore(NOTIFICATION_TIMES, notificationTimes)
            } else {
                throw new Error('No Internet Connection')
            }
        } else {
            slideData = asyncStoreSlides
        }
        dispatch({
            type: SET_ASSESSMENT_DATA,
            slides: slideData,
            repeats: repeatCount
        })
    }
}


export const setNotifications = () => {
    return async () => {

        const isScheduled = await getItemAsyncStore(SET_NOTIFICATION_SCHEDULED)

        //await Notifications.cancelAllScheduledNotificationsAsync()
        //
        if (!isScheduled) {
            //  if (true) {
            await checkNotificationPermission()


            // get time from timesArr
            const currentTime = Date.now()
            const dates = (await getItemAsyncStore(NOTIFICATION_TIMES, undefined, true)).filter(el => el - currentTime >= 0)
            let acc = dates.length -1
            while (acc >= 0) {
                const res = await scheduleNotificationHandler(dates[acc])
                if (res) acc--
            }


            // todo: loop over entire array and schedule all notifications in one turn!!
            try {
                // const allNotes = await posTimes.reduce(async (memo, time) => {
                //     const timeRes = await scheduleNotificationHandler(time)
                //     const memoSum = await memo
                //
                //     return memoSum + timeRes
                // }, 0)
                await saveItemAsyncStore(SET_NOTIFICATION_SCHEDULED, true, undefined)
            } catch (err) {
                throw new Error(err)
            }

        }

        // await checkNotificationPermission()
        // // testing
        // const testDates = [(new Date().getTime() + 1000 * 60 * 40 )] // 5min
        // await testDates.reduce( async (memo, t) => {
        //     await memo
        //     const time = t
        //     await scheduleNotificationHandler(time)
        //
        // }, undefined)
        //
        // // await scheduleNotificationHandler((testDate.getTime() + 10000))  // just for testing
        // await saveItemAsyncStore(NOTIFICATION_TIMES, testDates, undefined)

    }
}

export const setUserProgress = (newCount) => {
    return async (dispatch) => {
        await storeFac.saveItemAsyncStore(USER_PROGRESS, newCount)
        dispatch({type: SET_USER_PROGRESS, val: newCount})
    }
}

export const getUserProgress = () => {
    return async (dispatch) => {
        const asyncCount = await storeFac.getItemAsyncStore(USER_PROGRESS)
        if (!asyncCount) await dispatch(setUserProgress(0))  // CHANGED FOR GOOD? dispatch()
        else dispatch({type: SET_USER_PROGRESS, val: parseInt(asyncCount)})
    }
}

const createAssessmentObj = (userId, weatherData = undefined, userLoc, selection, time, skyImage, horizonImage) => {
    const skyImgBuffer = new Buffer(skyImage, 'base64')
    const horizonImgBuffer = new Buffer(horizonImage, 'base64')

    let answerArr = []
    selection.forEach((el) => el.answers.forEach((answer) => answerArr.push(answer)))
    let newSelectionObj = {}
    answerArr.forEach(el => newSelectionObj = {
        ...newSelectionObj,
        [el.domain]: {...newSelectionObj[el.domain], [el.questionId]: el.answerValue}
    })

    const newAssessment = new Assessment(userId, userLoc, newSelectionObj, time, skyImgBuffer, horizonImgBuffer)
    return newAssessment

}


export const fetchRestoredAssessment = (token) => {
    return async () => {
        const restoredAssessmentArr = await storeFac.getItemAsyncStore(ASSESSMENT_PENDING, undefined, true)

        if (restoredAssessmentArr && (await Network.getNetworkStateAsync()).isInternetReachable) {
            try {
                await fetchData(`${ENV.OwnApi}/assessments`, 'POST', restoredAssessmentArr, token)
                await deleteItemAsyncStore(ASSESSMENT_PENDING) //todo: not working ...
            } catch (err) {
                throw new Error(err)
            }
        } else {
            if (restoredAssessmentArr) throw new Error('Could not send Pending Assessment, no Internet Connection Available')
        }
    }

}

export const saveAssessment = (skyImage, horizonImage, time, selection) => {
    return async (dispatch, getState) => {
        const {token, user} = getState().auth
        const {userProgress} = getState().assessment

        const userCoords = await getUserLocation()
        const userLoc = {
            lat: userCoords.coords.latitude,
            lng: userCoords.coords.longitude
        }
        const newAssessment = createAssessmentObj(user.id, undefined, userLoc, selection, time, skyImage, horizonImage)

        // only send if network available
        if ((await Network.getNetworkStateAsync()).isInternetReachable) {
            try {
                await fetchData(`${ENV.OwnApi}/assessments`, 'POST', newAssessment, token)
            } catch (err) {
                await saveItemAsyncStore(ASSESSMENT_PENDING, newAssessment)
            }
        } else {
            await saveItemAsyncStore(ASSESSMENT_PENDING, newAssessment)
        }
        await dispatch(setUserProgress(userProgress + 1))
    }
}




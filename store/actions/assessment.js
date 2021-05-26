import * as Network from 'expo-network'


import * as Notifications from 'expo-notifications'
import ENV from '../../env'
import Assessment from "../../models/assessment";
import * as storeFac from '../../helpers/asyncStoreFactories'
import {fetchData} from '../../helpers/fetchFactories'
import {scheduleNotificationHandler, checkNotificationPermission} from '../../helpers/notificationHandler'
import {getUserLocation} from "../../helpers/permissonFactories";
import {getItemAsyncStore, saveItemAsyncStore, deleteItemAsyncStore} from "../../helpers/asyncStoreFactories";
import {fetchAssessmentsFromDB, deleteAssessmentFromDB, insertAssessmentToDB, init} from "../../helpers/db";

import {Buffer} from "buffer";


export const SET_USER_PROGRESS = 'SET_USER_PROGRESS'
export const SET_ASSESSMENT_DATA = 'SET_ASSESSMENT_DATA_NEW'
export const ASSESSMENT_PENDING = 'ASSESSMENT_PENDING'


export const USER_PROGRESS = 'USER_PROGRESS'
export const ASSESSMENT_DATA = 'ASSESSMENT_DATA'
export const NOTIFICATION_TIMES = 'NOTIFICATION_TIMES'
export const SET_NOTIFICATION_STATE = 'SET_NOTIFICATION_STATE'


export const removeScheduledTime = (time) => {
    return async () => {
        await Notifications.dismissAllNotificationsAsync() // Removes notification displayed in the notification tray (Notification Center).
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
        const asyncStoreSlides = await storeFac.getItemAsyncStore(ASSESSMENT_DATA, false, true)

        if (!asyncStoreSlides) {
            if ((await Network.getNetworkStateAsync()).isInternetReachable) {
                slideData = await fetchData(`${ENV.OwnApi}/slides`, 'GET', null, token)
                slideData = slideData.data.data

                await storeFac.saveItemAsyncStore(ASSESSMENT_DATA, slideData)
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
        const hasPermission = (await checkNotificationPermission()).granted
        const isScheduled = !!(await Notifications.getAllScheduledNotificationsAsync())

        await scheduleNotificationHandler(Date.now() + 1000)

        if (!isScheduled && hasPermission) {
            const currentTime = Date.now()
            const dates = (await getItemAsyncStore(NOTIFICATION_TIMES, undefined, true)).filter(el => el - currentTime >= 0)
            try {
                let acc = dates.length - 1
                while (acc >= 0) {
                    const res = await scheduleNotificationHandler(dates[acc])
                    if (res) acc--
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    }
}

export const incrementUserProgress = (progress) => {
    return async (dispatch) => {
        let newProgress
        const currentProgress = await storeFac.getItemAsyncStore(USER_PROGRESS, false)
        if (!currentProgress) newProgress = 0
        else if (!!progress) {
            newProgress = progress
        } else newProgress = +currentProgress + 1
        await storeFac.saveItemAsyncStore(USER_PROGRESS, newProgress)
        dispatch(setUserProgressState())
    }
}

export const setUserProgressState = () => {
    return async (dispatch) => {
        const asyncCount = await storeFac.getItemAsyncStore(USER_PROGRESS, false, undefined)
        if (!asyncCount) await dispatch(incrementUserProgress())
        else await dispatch({type: SET_USER_PROGRESS, val: asyncCount})
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

export const setAssessmentPendingState = () => {
    return async (dispatch) => {
        const isPendingRes = await storeFac.getItemAsyncStore(ASSESSMENT_PENDING)
        dispatch({type: ASSESSMENT_PENDING, val: isPendingRes})
    }
}


export const fetchRestoredAssessment = (token) => {
    return async (dispatch) => {
        await init() // initialize database
        const restoredAssessmentArr = (await fetchAssessmentsFromDB()).rows._array

        if (restoredAssessmentArr.length > 0 && (await Network.getNetworkStateAsync()).isInternetReachable) {
            let acc = restoredAssessmentArr.length
            while (acc > 0) {
                try {
                    const res = await fetchData(`${ENV.OwnApi}/assessments`, 'POST', JSON.parse(restoredAssessmentArr[acc - 1].assessment), token)
                    const resdb = await deleteAssessmentFromDB()

                    if (!!res) acc--
                } catch (err) {
                    throw new Error('Senden Fehlgeschlagen, Antworten werden fürs nächste Mal gespeichert.')
                }
            }
        } else if (restoredAssessmentArr.length > 0) {
            throw new Error('Senden Fehlgeschlagen - Keine Internet Verbindung verfügbar.')
        }
        await storeFac.deleteItemAsyncStore(ASSESSMENT_PENDING, false)
        dispatch({type: ASSESSMENT_PENDING, val: false})
    }

}

export const saveAssessment = (skyImage, horizonImage, time, selection) => {
    return async (dispatch, getState) => {
        const {token, user} = getState().auth

        const userCoords = await getUserLocation()
        const userLoc = {
            lat: userCoords.coords.latitude,
            lng: userCoords.coords.longitude
        }
        const newAssessment = createAssessmentObj(user.id, undefined, userLoc, selection, time, skyImage, horizonImage)

        // only send if network available
        if ((await Network.getNetworkStateAsync()).isInternetReachable) {
            try {
                const response = await fetchData(`${ENV.OwnApi}/assessments`, 'POST', newAssessment, token)
                if (response?.data?.updateSlides) await deleteItemAsyncStore(ASSESSMENT_DATA) // re-fetch slides after this
            } catch (err) {
                await saveAssessmentToDatabase(newAssessment)
                await dispatch(incrementUserProgress())
                throw new Error('Senden Fehlgeschlagen, Antworten werden zwischengespeichert und mit der nächsten Befragung gesendet.')
            }
        } else {
            await saveAssessmentToDatabase(newAssessment)
            await dispatch(incrementUserProgress())
            throw new Error('Senden Fehlgeschlagen - Keine Internet Verbindung verfügbar. Deine Antworten wurden aber gerettet =)')
        }
        await dispatch(incrementUserProgress())
    }
}

const saveAssessmentToDatabase = async (assessment) => {
    const assessmentWithoutImgStr = JSON.stringify(assessment)
    try {
        await init() // initialize database
        await insertAssessmentToDB(assessmentWithoutImgStr)
        await storeFac.saveItemAsyncStore(ASSESSMENT_PENDING, true, false)
    } catch (err) {
        throw new Error('Befragung konnte leider nicht zwischengespeichert werden.')
    }

}





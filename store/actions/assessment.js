import * as Network from 'expo-network'
import * as FileSystem from 'expo-file-system'

import * as Notifications from 'expo-notifications'
import vars from '../../env'
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
export const VALID_COMPLETION_TIME = 'VALID_COMPLETION_TIME'


export const USER_PROGRESS = 'USER_PROGRESS'
export const ASSESSMENT_DATA = 'ASSESSMENT_DATA'
export const NOTIFICATION_TIMES = 'NOTIFICATION_TIMES'
export const SET_NOTIFICATION_STATE = 'SET_NOTIFICATION_STATE'

const {StudyEnd, OwnApiUrl} = vars

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
                slideData = await fetchData(`${OwnApiUrl}/slides`, 'GET', null, token)
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
    return async (dispatch) => {
        const hasPermission = (await checkNotificationPermission()).granted

        const isScheduled = (await Notifications.getAllScheduledNotificationsAsync()).length > 0
        const currentTime = Date.now()
        const notificationDates = await getItemAsyncStore(NOTIFICATION_TIMES, undefined, true)

        if (!isScheduled && hasPermission) {
            const futureDates = notificationDates.filter(el => el - currentTime >= 0)
            try {
                let acc = futureDates.length - 1
                while (acc >= 0) {
                    const res = await scheduleNotificationHandler(futureDates[acc])
                    if (res) acc--
                }
            } catch (err) {
                throw new Error(err)
            }
        }
    }
}

export const incrementUserProgress = (progress = null) => {
    return async (dispatch, getState) => {
        const { userProgress } = getState().assessment
        let newProgress
        if (progress !== null) newProgress = progress
        else newProgress = +userProgress + 1
        await storeFac.saveItemAsyncStore(USER_PROGRESS, newProgress)
        dispatch(setUserProgressState())
    }
}

export const setUserProgressState = () => {
    return async (dispatch) => {
        const asyncCount = await storeFac.getItemAsyncStore(USER_PROGRESS, false, undefined)
        if (asyncCount) await dispatch({type: SET_USER_PROGRESS, val: asyncCount})
    }
}

const createAssessmentObj = (userId, weatherData = undefined, userLoc, selection, time, skyImage, horizonImage) => {
    const skyImgBuffer = new Buffer(skyImage.base64, 'base64')
    const horizonImgBuffer = new Buffer(horizonImage.base64, 'base64')

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
                    const restoredAssessment = await recreateAssessmentFromDB(restoredAssessmentArr[acc - 1])
                    const res = await fetchData(`${OwnApiUrl}/assessments`, 'POST', restoredAssessment, token)
                    if (!!res) acc--
                } catch (err) {
                    throw new Error('Senden Fehlgeschlagen, Antworten werden fürs nächste Mal gespeichert.')
                }
            }
            await deleteAssessmentFromDB()
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
                const response = await fetchData(`${OwnApiUrl}/assessments`, 'POST', newAssessment, token)
                if (response?.data?.updateSlides) await deleteItemAsyncStore(ASSESSMENT_DATA) // re-fetch slides after this
            } catch (err) {
                await saveAssessmentToDatabase(newAssessment, skyImage, horizonImage, userProgress)
                await dispatch(incrementUserProgress())
                throw new Error('Senden Fehlgeschlagen, Antworten werden zwischengespeichert und mit der nächsten Befragung gesendet.')
            }
        } else {
            await saveAssessmentToDatabase(newAssessment, skyImage, horizonImage, userProgress)
            await dispatch(incrementUserProgress())
            throw new Error('Senden Fehlgeschlagen - Keine Internet Verbindung verfügbar. Deine Antworten wurden aber gerettet =)')
        }
        await dispatch(incrementUserProgress())
        dispatch(setNotificationState(null))
    }
}

const saveAssessmentToDatabase = async (assessment, skyImage, horizonImage, userProgress) => {
    const movedImages = await movePicturesToFS(skyImage.uri, horizonImage.uri, userProgress)
    assessment.images = null
    const assessmentWithoutImgStr = JSON.stringify(assessment)
    try {
        await init() // initialize database
        const res = await insertAssessmentToDB(assessmentWithoutImgStr, movedImages.newPathSkyImg, movedImages.newPathHorizonImg)
        console.log(res)
        await storeFac.saveItemAsyncStore(ASSESSMENT_PENDING, true, false)
    } catch (err) {
        console.log(err)
        throw new Error('Befragung konnte leider nicht zwischengespeichert werden.')
    }

}

const movePicturesToFS = async (skyImageUri, horizonImageUri, userProgress) => {
    const imgSkyFilename = skyImageUri.split('/').pop()
    const imgHorizonFilename = horizonImageUri.split('/').pop()

    const newPathSkyImg = FileSystem.documentDirectory + imgSkyFilename + userProgress
    const newPathHorizonImg = FileSystem.documentDirectory + imgHorizonFilename + userProgress

    try {
        const moveResSkyFile = await FileSystem.moveAsync({
            from: skyImageUri, to: newPathSkyImg
        })
        const moveResHorizonFile = await FileSystem.moveAsync({
            from: horizonImageUri, to: newPathHorizonImg
        })
    } catch (err) {
        console.log(err);
        throw err
    }

    return {newPathSkyImg, newPathHorizonImg}

}

const transformUriToBuffer = async (restoredAssessment) => {
    const skyInBase64 = await FileSystem.readAsStringAsync(restoredAssessment.imageSkyUri, {encoding: "base64"})
    const horizonInBase64 = await FileSystem.readAsStringAsync(restoredAssessment.imageHorizonUri, {encoding: "base64"})

    const skyImgBuffer = new Buffer(skyInBase64, 'base64')
    const horizonImgBuffer = new Buffer(horizonInBase64, 'base64')

    return ([
        {description: "sky", data: skyImgBuffer},
        {description: "horizon", data: horizonImgBuffer}
    ])

}

const recreateAssessmentFromDB = async (restoredAssessment) => {
    const imgBuffArr = await transformUriToBuffer(restoredAssessment)
    const assessmentObj = JSON.parse(restoredAssessment.assessmentStr)
    assessmentObj.images = imgBuffArr

    return assessmentObj
}

export const fetchAssessmentStats = () => {
    return async (dispatch, getState) => {
        const {token, user, repeatCount} = getState().auth
        let isValid

        isValid = await storeFac.getItemAsyncStore(VALID_COMPLETION_TIME)

        if (isValid === null) {
            const statsRes = await fetchData(`${OwnApiUrl}/assessments/${user.id}/assessmentStats`, 'GET', null, token)
            if (statsRes.status === 'success') {
                const dateDifference = (new Date(statsRes.stats.lastAssessment) - new Date(statsRes.stats.firstAssessment)) / 1000 / 60 / 60 / 24

                if (statsRes.stats.avgCompletionTime >= 1.5 && statsRes.stats.numAssessments >= repeatCount && dateDifference <= 20) isValid = true
                else isValid = false
                await storeFac.saveItemAsyncStore(VALID_COMPLETION_TIME, isValid, false)
            }
        }
        dispatch({type: VALID_COMPLETION_TIME, val: isValid})
    }
}

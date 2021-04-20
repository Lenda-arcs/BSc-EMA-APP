import ENV from '../../ENV'
import * as storeFac from '../../helpers/asyncStoreFactories'
import { fetchData } from '../../helpers/fetchFactories'
import { scheduleNotificationHandler } from '../../helpers/notificationHandler'
import * as Notifications from "expo-notifications";
import {getItemAsyncStore, saveItemAsyncStore, deleteItemAsyncStore} from "../../helpers/asyncStoreFactories";

import {Buffer} from "buffer";

export const ADD_ASSESSMENT = 'ADD_ASSESSMENT'
export const SET_USER_PROGRESS = 'SET_USER_PROGRESS'
export const SET_ASSESSMENT_DATA = 'SET_ASSESSMENT_DATA'
export const SET_NOTIFICATION_SCHEDULED = 'SET_NOTIFICATION_SCHEDULED'
export const ASSESSMENT_PENDING = 'ASSESSMENT_PENDING'


export const USER_PROGRESS = 'USER_PROGRESS'
export const ASSESSMENT_DATA = 'ASSESSMENT_DATA'
export const NOTIFICATION_TIMES = 'NOTIFICATION_TIMES'



export const setAssessmentData = () => {
    return async (dispatch, getState) => {
        const {token , repeatCount} = getState().auth

        let slideData
        let notificationTimes = []

        const asyncStoreSlides = await storeFac.getItemAsyncStore(ASSESSMENT_DATA, false, true)

        if (!asyncStoreSlides) {
            slideData = await fetchData(`${ENV.TempOwnApi}/slides`, 'GET', null, token)
            notificationTimes = slideData.attachment
            slideData = slideData.data.data

            await storeFac.saveItemAsyncStore(ASSESSMENT_DATA, slideData)
            await storeFac.saveItemAsyncStore(NOTIFICATION_TIMES, notificationTimes)


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

        if (!isScheduled) {
            // get time from timesArr
            const dates = (await getItemAsyncStore(NOTIFICATION_TIMES, undefined, true))
            // todo: loop over entire array and schedule all notifications in one turn!!
            dates.reduce(async (memo, t) => {
                await memo
                const date = (t.split(' G'))[0]
                const time = (new Date(date)).getTime()
                await scheduleNotificationHandler(time)
            }, undefined)

            await saveItemAsyncStore(SET_NOTIFICATION_SCHEDULED, true, undefined)


        }
        //await scheduleNotificationHandler((new Date().getTime() + 3000))  // just for testing


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

const getWeatherData = async (userLoc) => {
    const weatherToken = ENV.WeatherToken
    const searchRadius = 100
    const weatherData = await fetchData(`${ENV.WeatherApi}/stations/latest?radius=${userLoc.lat},${userLoc.lng},${searchRadius}&token=${weatherToken}`, 'GET')
    const nearestStationData = weatherData.STATION[0]
    return nearestStationData
}

const createAssessmentObj = (userId, weatherData, userLoc, selection, time, skyImage, horizonImage) => {
    const skyImgBuffer = new Buffer(skyImage, 'base64')
    const horizonImgBuffer = new Buffer(horizonImage, 'base64')
    return (
       {
           user: userId[1],
           weather: weatherData,
           location: {
               coordinates: [userLoc.lng, userLoc.lat]
           },
           selection: selection,
           images: [
               {
                   description: "sky",
                   data: skyImgBuffer
               },
               {
                   description: "horizon",
                   data: horizonImgBuffer
               }
           ],
           timeStamp: {
               assessmentStart: time.start,
               assessmentEnd: time.end
           }
       }
   )
}
//

const fetchRestoredAssessment = async (token) => {
    const restoredAssessmentArr = await storeFac.getItemAsyncStore(ASSESSMENT_PENDING, undefined, true)

    if (restoredAssessmentArr) {
        restoredAssessmentArr.reduce(async (memo, assessment) => {
            await memo
            await fetchData(`${ENV.TempOwnApi}/assessments`, 'POST', assessment, token)
        }, undefined)
    }
}

export const saveAssessment = (skyImage, horizonImage, time, selection, userLoc) => {
    return async (dispatch, getState) => {
        const { token, userId } = getState().auth
        const { userProgress } = getState().assessment

        // check if some assessment data is pending in asyncStorage and send it to server
        // todo: functionality not checked yet
        const restoredAssessmentRes = await fetchRestoredAssessment(token)
        if (restoredAssessmentRes) await deleteItemAsyncStore(ASSESSMENT_PENDING)

        const weatherData = await getWeatherData(userLoc)
        const newAssessment = createAssessmentObj(userId, weatherData, userLoc, selection, time, skyImage, horizonImage)

        const sendToServerRes = await fetchData(`${ENV.TempOwnApi}/assessments`, 'POST', newAssessment, token)

        // if sending failed -> temp save to async
        // todo: functionality not checked yet
        if (!sendToServerRes) {
            const pendingAssessmentArr = await getItemAsyncStore(ASSESSMENT_PENDING,undefined, true)
            if (!pendingAssessmentArr) await saveItemAsyncStore(ASSESSMENT_PENDING, newAssessment)
            else {
                pendingAssessmentArr.push(newAssessment)
                await saveItemAsyncStore(ASSESSMENT_PENDING, pendingAssessmentArr)
            }
        }

        await dispatch(setUserProgress(userProgress + 1))
    }
}






import * as Network from 'expo-network'

import ENV from '../../env'
import Assessment from "../../models/assessment";
import * as storeFac from '../../helpers/asyncStoreFactories'
import { fetchData } from '../../helpers/fetchFactories'
import { scheduleNotificationHandler } from '../../helpers/notificationHandler'
import { getUserLocation } from "../../helpers/permissonFactories";
import {getItemAsyncStore, saveItemAsyncStore, deleteItemAsyncStore} from "../../helpers/asyncStoreFactories";

import {Buffer} from "buffer";

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
            slideData = await fetchData(`${ENV.OwnApi}/slides`, 'GET', null, token)
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
        //await scheduleNotificationHandler((new Date().getTime() + 6000))  // just for testing

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
    const newAssessment = new Assessment(userId, userLoc, selection, time, skyImgBuffer, horizonImgBuffer)
    console.log(newAssessment)
    return newAssessment
       // {
       //     user: userId[1],
       //     weather: undefined,
       //     location: {
       //         coordinates: [userLoc.lng, userLoc.lat]
       //     },
       //     selection: selection,
       //     images: [
       //         {
       //             description: "sky",
       //             data: skyImgBuffer
       //         },
       //         {
       //             description: "horizon",
       //             data: horizonImgBuffer
       //         }
       //     ],
       //     timeStamp: {
       //         assessmentStart: time.start,
       //         assessmentEnd: time.end
       //     }
       // }

}


const fetchRestoredAssessment = async (token) => {
    const restoredAssessmentArr = await storeFac.getItemAsyncStore(ASSESSMENT_PENDING, undefined, true)
    if (restoredAssessmentArr) await fetchData(`${ENV.OwnApi}/assessments`, 'POST', restoredAssessmentArr, token)

}

export const saveAssessment = (skyImage, horizonImage, time, selection) => {
    return async (dispatch, getState) => {
        const { token, userId } = getState().auth
        const { userProgress  } = getState().assessment

        const userCoords = await getUserLocation()
        const userLoc = {
            lat: userCoords.coords.latitude,
            lng: userCoords.coords.longitude
        }

        const newAssessment = createAssessmentObj(userId,undefined, userLoc, selection, time, skyImage, horizonImage)

        const networkStateRes = await Network.getNetworkStateAsync()
        // only send if network available
        if (networkStateRes.isInternetReachable) {
            const restoredAssessmentRes = await fetchRestoredAssessment(token)
            if (restoredAssessmentRes) await deleteItemAsyncStore(ASSESSMENT_PENDING) //todo: not working ...

            await fetchData(`${ENV.OwnApi}/assessments`, 'POST', newAssessment, token)

        } else {
            // not working for multiple missed assessment fetches..
            // async storage too small for that purpose
            const newAssessment = createAssessmentObj(userId, undefined, userLoc, selection, time, skyImage, horizonImage)
            const pendingAssessmentArr = await getItemAsyncStore(ASSESSMENT_PENDING,undefined, true)

            if (!pendingAssessmentArr) await saveItemAsyncStore(ASSESSMENT_PENDING, newAssessment)
            // else {
            //     pendingAssessmentArr.push(newAssessment)
            //     for (let i = 0; i < pendingAssessmentArr.length, i++) {
            //         await saveItemAsyncStore()
            //     }
            //     await saveItemAsyncStore(ASSESSMENT_PENDING, pendingAssessmentArr)
            // }
        }

        await dispatch(setUserProgress(userProgress + 1))
    }
}






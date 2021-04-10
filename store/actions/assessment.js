import ENV from '../../ENV'
import * as storeFac from '../../helpers/asyncStoreFactories'
import { fetchData } from '../../helpers/fetchFactories'

export const ADD_ASSESSMENT = 'ADD_ASSESSMENT'
export const SET_ASSESSMENT_COUNT = 'SET_ASSESSMENT_COUNT'
export const SET_ASSESSMENT_DATA = 'SET_ASSESSMENT_DATA'

export const ASSESSMENT_COUNT = 'ASSESSMENT_COUNT'
export const ASSESSMENT_DATA = 'ASSESSMENT_DATA'
export const NOTIFICATION_TIMES = 'NOTIFICATION_TIMES'



export const setAssessmentData = () => {
    return async (dispatch, getState) => {
        const userToken = getState().auth.token
        let slideData
        let notificationTimes = []

        const asyncStoreSlides = await storeFac.getItemAsyncStore(ASSESSMENT_DATA, false, true)

        if (!asyncStoreSlides) {
            slideData = await fetchData(`${ENV.TempOwnApi}/slides`, 'GET', null, userToken)
            notificationTimes = slideData.attachment
            slideData = slideData.data.data

            await storeFac.saveItemAsyncStore(ASSESSMENT_DATA, slideData)
            await storeFac.saveItemAsyncStore(NOTIFICATION_TIMES, notificationTimes)

        } else {
            slideData = asyncStoreSlides
        }
        dispatch({
            type: SET_ASSESSMENT_DATA,
            slides: slideData
        })
    }
}

export const setAssessmentCount = (newCount) => {
    return async (dispatch) => {
        await storeFac.saveItemAsyncStore(ASSESSMENT_COUNT, newCount)
        dispatch({type: SET_ASSESSMENT_COUNT, val: newCount})
    }
}

export const getAssessmentCount = () => {
    return async (dispatch) => {
        const asyncCount = await storeFac.getItemAsyncStore(ASSESSMENT_COUNT)
        if (!asyncCount) await dispatch(setAssessmentCount(0))  // CHANGED FOR GOOD? dispatch()
        else dispatch({type: SET_ASSESSMENT_COUNT, val: parseInt(asyncCount)})
    }
}

const getWeatherData = async (userLoc) => {
    const weatherToken = ENV.WeatherToken
    const weatherData = await fetchData(`${ENV.WeatherApi}/stations/latest?radius=${userLoc.lat},${userLoc.lng},${20}&token=${weatherToken}`, 'GET')
    const nearestStationData = weatherData.STATION[0]
    return nearestStationData
}

const createAssessmentObj = (userId, weatherData, userLoc, selection, time, skyImage, horizonImage) => (
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
                base64: skyImage
            },
            {
                description: "horizon",
                base64: horizonImage
            }
        ],
        timeStamp: {
            assessmentStart: time.start,
            assessmentEnd: time.end
        }
    }
)

const saveAssessmentToStorage = async (assessment) => {

}

const getAssessmentFromStorage = async () => {

}

const fetchAssessmentFromStorage = async () => {

}

export const saveAssessment = (skyImage, horizonImage, time, selection, userLoc) => {
    return async (dispatch, getState) => {
        const {token, userId} = getState().auth
        const assessmentCount = getState().assessments.assessmentCount

        // check if some assessment data is pending in asyncStorage  todo: functionality not checked yet
        //const restoredAssessment = await storeFac.getItemAsyncStore(`ASSESSMENT_${assessmentCount-1}_RESTORED`)
      //  if (restoredAssessment) await fetchData(`${ENV.TempOwnApi}/assessments`, 'POST', restoredAssessment, token)


        const weatherData = await getWeatherData(userLoc)

        const newAssessment = createAssessmentObj(userId, weatherData, userLoc, selection, time, skyImage, horizonImage)

        const sendToServerRes = await fetchData(`${ENV.TempOwnApi}/assessments`, 'POST', newAssessment, token)

        // if sending failed -> temp save to async todo: functionality not checked yet
       // if (!sendToServerRes.ok) await storeFac.saveItemAsyncStore(`ASSESSMENT_${assessmentCount}_RESTORED`, newAssessment)

        // todo: check if working
        await dispatch(setAssessmentCount(assessmentCount + 1))
    }
}






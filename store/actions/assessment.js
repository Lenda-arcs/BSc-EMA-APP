import ENV from '../../ENV'
import * as storeFac from './../../helpers/storeFactories'

export const ADD_ASSESSMENT = 'ADD_ASSESSMENT'
export const SET_ASSESSMENT_COUNT = 'SET_ASSESSMENT_COUNT'
export const SET_ASSESSMENT_DATA = 'SET_ASSESSMENT_DATA'

export const ASSESSMENT_COUNT = 'ASSESSMENT_COUNT'
export const ASSESSMENT_DATA = 'ASSESSMENT_DATA'


export const setAssessmentData = () => {
    return async (dispatch, getState) => {
        const userToken = getState().auth.token
        let slideData

        const asyncStoreSlides = await storeFac.getItemAsyncStore(ASSESSMENT_DATA)
        if (!asyncStoreSlides) {
            slideData = await storeFac.fetchData(`${ENV.TempOwnApi}/slides`, 'GET', null, userToken)

            slideData = slideData.data.data
            await storeFac.saveItemAsyncStore(ASSESSMENT_DATA, slideData)

        } else {
            const transformedData = JSON.parse(asyncStoreSlides)
            slideData = transformedData
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
        if (!asyncCount) await setAssessmentCount(0)
        else dispatch({type: SET_ASSESSMENT_COUNT, val: parseInt(asyncCount)})
    }
}


export const saveAssessment = (skyImage, horizonImage, time, selection, userLoc) => {
    return async (dispatch, getState) => {

        const {token, userId} = getState().auth
        const assessmentCount = getState().assessments.assessmentCount
        const weatherToken = ENV.WeatherToken


        const weatherData = await storeFac.fetchData(`${ENV.WeatherApi}/stations/latest?radius=${userLoc.lat},${userLoc.lng},${20}&token=${weatherToken}`, 'GET')
        const nearestStationData = weatherData.STATION[0]

        const newAssessment = {
            user: userId[1],
            weather: nearestStationData,
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
        const sendToServerRes = await storeFac.fetchData(`${ENV.TempOwnApi}/assessments`, 'POST', newAssessment, token)


        // todo: check if working
        await dispatch(setAssessmentCount(assessmentCount + 1))
        console.log(sendToServerRes)
    }
}




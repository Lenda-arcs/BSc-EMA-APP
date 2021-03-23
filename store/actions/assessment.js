import ENV from '../../ENV'
import AsyncStorage from "@react-native-async-storage/async-storage";


export const ADD_ASSESSMENT = 'ADD_ASSESSMENT'
export const SET_ASSESSMENT_COUNT = 'SET_ASSESSMENT_COUNT'

export const ASSESSMENT_COUNT = 'ASSESSMENT_COUNT'


const setAssessmentCount = async () => {
    try {
        const count = await AsyncStorage.getItem(ASSESSMENT_COUNT)
        if (count !== null) await saveAssessmentCountStorage(parseInt(count) + 1)
        else await saveAssessmentCountStorage(1)
    } catch (err) {
        throw new Error(err)
    }

}

const saveAssessmentCountStorage = async (count) => {
    try {
        await AsyncStorage.setItem(ASSESSMENT_COUNT, count.toString())
    } catch (err) {
        throw new Error(err)
    }
}


export const addAssessment = (skyImage, horizonImage, time, selection, userLoc, assessmentCount) => {
    console.log(selection)

    return async (dispatch, getState) => {

        const userToken = getState().auth.token
        const userId = getState().auth.userId

        // todo: check if good to check that late? probably better to ask for it with taking pictures


        const token = ENV.WeatherToken
        // todo: specify weather data
        const weatherData = await
            // fetches nearest station within 20 miles radius
            fetch(`https://api.synopticdata.com/v2/stations/latest?radius=${userLoc.lat},${userLoc.lng},${20}&token=${token}`)

        if (!weatherData) {
            throw new Error('Something went wrong!')
        }
        const weatherResponseData = await weatherData.json()

        if (!weatherResponseData) {
            throw new Error('Something went wrong!')
        }

        const assessment = {
            timestamp: time,
            slidePicks: selection,
            images: {
                sky: skyImage,
                horizon: horizonImage
            },
            coords: userLoc,
            weather: weatherResponseData
        }

        const response = await fetch(`https://mybsc-ema-default-rtdb.firebaseio.com/assessment-test/user/${userId}/${assessmentCount}.json?auth=${userToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/.json'
            },
            body: JSON.stringify(assessment)
        })
        await dispatch(setAssessmentCount)
        const resData = await response.json()



    }
}




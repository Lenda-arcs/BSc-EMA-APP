import ENV from '../../ENV'
import AsyncStorage from "@react-native-async-storage/async-storage";


export const ADD_ASSESSMENT = 'ADD_ASSESSMENT'
export const SET_ASSESSMENT_COUNT = 'SET_ASSESSMENT_COUNT'
export const SET_ASSESSMENT_DATA = 'SET_ASSESSMENT_DATA'

export const ASSESSMENT_COUNT = 'ASSESSMENT_COUNT'
export const ASSESSMENT_DATA = 'ASSESSMENT_DATA'


export const setAssessmentData = () => {

    return async (dispatch, getState) => {
        const userToken = getState().auth.token
        let slideData

        try {
            const asyncStoreSlides = await AsyncStorage.getItem(ASSESSMENT_DATA)

            if (!asyncStoreSlides) {
                const res = await fetch(`${ENV.TempOwnApi}/slides`, {
                    headers: {
                        "Authorization": `Bearer ${userToken}`
                    }
                })
                if (res) {
                    const resData = await res.json()
                    slideData = resData.data.data

                    await AsyncStorage.setItem(ASSESSMENT_DATA, JSON.stringify({
                        slides: slideData
                    }))

                }
            }
            else {
                const transformedData = JSON.parse(asyncStoreSlides)
                slideData = transformedData.slides
            }

            dispatch({
                type: SET_ASSESSMENT_DATA,
                slides: slideData
            })
        } catch (err) {
            console.log(err)
        }


    }
}

export const setAssessmentCount = (newCount) => {

    return async (dispatch) => {
        try {
            await AsyncStorage.setItem(ASSESSMENT_COUNT, newCount.toString())

            dispatch({type:SET_ASSESSMENT_COUNT, val: newCount})

        } catch (err) {
            throw new Error(err)
        }
    }
}

export const getAssessmentCount = () => {

    let count
    return async (dispatch) => {
        try {
            const asyncCount = await AsyncStorage.getItem(ASSESSMENT_COUNT)
            if (!count) {
                await AsyncStorage.setItem(ASSESSMENT_COUNT, '0')
                count = 0
            }
            else  {
                count = asyncCount
                dispatch({type:SET_ASSESSMENT_COUNT, val: parseInt(count)})
            }


        } catch (err) {
            throw new Error(err)
        }
    }
}




export const saveAssessment = (skyImage, horizonImage, time, selection, userLoc) => {

    return async (dispatch, getState) => {

        const userToken = getState().auth.token
        const userId = getState().auth.userId
        const assessmentCount = getState().assessments.assessmentCount
        const token = ENV.WeatherToken


        try {
            const weatherData = await
                // fetches nearest station within 20 miles radius
                fetch(`${ENV.WeatherApi}/stations/latest?radius=${userLoc.lat},${userLoc.lng},${20}&token=${token}`)

            const weatherResData = await weatherData.json()
            const nearestStationData = weatherResData.STATION[0]

            const response = await fetch(`${ENV.TempOwnApi}/assessments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${userToken}`
                },
                // not working yet
                body: JSON.stringify(
                    {
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
                )
            })

            const resData = await response.json()
            console.log(resData)

            // todo: maybe refactor
            if (resData.status === 'success') await dispatch(setAssessmentCount(assessmentCount+1))

            //todo: handle possible fetch fail, and store assessment temp in asyncStorage


        } catch (err) {
            if (err) throw new Error('Something went wrong during fetching data')
        }

    }
}




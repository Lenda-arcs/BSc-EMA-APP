import {
    SET_NOTIFICATION_STATE,
    SET_USER_PROGRESS, SET_ASSESSMENT_DATA
} from "../actions/assessment";

// todo: integrate assessment count
const initialState = {
    availableSlides: [],
    userProgress: 0,
    notificationState: null
}


export default (state = initialState, action) => {

    switch (action.type) {
        case SET_USER_PROGRESS:
            return {...state, userProgress: action.val}
        case SET_NOTIFICATION_STATE:
            return {...state, notificationState: action.val}
        case  SET_ASSESSMENT_DATA:
            const currentSlides = action.slides
            const assessmentRepeats = action.repeats
            /// Dismiss demo question slide
            if (state.userProgress > 0) {
                const demoSlide = currentSlides.shift()
                /// Dismiss effect question slide

                if (state.userProgress !== assessmentRepeats - 1) {

                    const effectSlideIndex = currentSlides.findIndex(el => el.name === 'effect')
                    currentSlides.splice(effectSlideIndex, 1)


                }
            }
            return {...state, availableSlides: currentSlides}
        default:
            return state
    }

}

import {
    SET_NOTIFICATION_STATE,
    SET_USER_PROGRESS, SET_ASSESSMENT_DATA, ASSESSMENT_PENDING
} from "../actions/assessment";

// todo: integrate assessment count
const initialState = {
    availableSlides: [],
    userProgress: 0,
    notificationState: null,
    pendingAssessment: false
}


export default (state = initialState, action) => {

    switch (action.type) {
        case SET_USER_PROGRESS:
            return {...state, userProgress: action.val}
        case SET_NOTIFICATION_STATE:
            return {...state, notificationState: action.val}
        case ASSESSMENT_PENDING:
            return {...state, pendingAssessment: !!action.val}
        case  SET_ASSESSMENT_DATA:
            const currentSlides = action.slides
            const assessmentRepeats = action.repeats
            /// Dismiss demo question slide
            const start = state.userProgress == 0
            const end = state.userProgress == assessmentRepeats - 1
            const middle = state.userProgress == Math.round(assessmentRepeats / 2)
            let newSlides = []
            currentSlides.forEach(slide => {
                if (slide.displayAt === 'start' &&  start) newSlides.push(slide)
                else if (slide.displayAt === 'end' && end) newSlides.push(slide)
                else if (slide.displayAt === 'middle' && middle) newSlides.push(slide)
                else if (slide.displayAt === 'always') newSlides.push(slide)
            })

            return {...state, availableSlides: newSlides}
        default:
            return state
    }


}

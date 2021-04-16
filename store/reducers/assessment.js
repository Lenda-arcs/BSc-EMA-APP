
import {
    SET_NOTIFICATION_SCHEDULED,
    SET_ASSESSMENT_COUNT, SET_ASSESSMENT_DATA
} from "../actions/assessment";

// todo: integrate assessment count
const initialState = {
    availableSlides: [],
    userProgress: 0,
    //notificationScheduled: false
}


export default (state = initialState, action) => {

    switch (action.type) {
        case SET_ASSESSMENT_COUNT:
            return {...state, userProgress: action.val}
        case  SET_ASSESSMENT_DATA:
            return {...state, availableSlides: action.slides}
        // case SET_NOTIFICATION_SCHEDULED:
        //     return {...state, notificationScheduled: true}
        default:
            return state
    }

}

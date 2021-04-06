
import {
    ADD_ASSESSMENT,
    SET_ASSESSMENT_COUNT, SET_ASSESSMENT_DATA
} from "../actions/assessment";

// todo: integrate assessment count
const initialState = {
    availableSlides: [],
    assessmentCount: 0,
}


export default (state = initialState, action) => {

    switch (action.type) {
        case SET_ASSESSMENT_COUNT:
            return {...state, assessmentCount: action.val}
        case  SET_ASSESSMENT_DATA:
            return {...state, availableSlides: action.slides}
        default:
            return state
    }

}

import ASSESSMENT_SLIDES from "../../data/slides-data";

import {
    ADD_ASSESSMENT,
    SET_ASSESSMENT_COUNT
} from "../actions/assessment";

// todo: integrate assessment count
const initialState = {
    availableSlides: ASSESSMENT_SLIDES,
    assessmentCount: 0,
}


export default (state = initialState, action) => {

    switch (action.type) {
        case SET_ASSESSMENT_COUNT:
            return {...state, assessmentCount: action.count}
        default:
            return state
    }

}

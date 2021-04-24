import {AUTHENTICATE, LOGOUT, SET_DID_TRY_AL, SET_IS_FIRST_LAUNCH} from '../actions/auth'

const initialState = {
    token: null,
    userId: null,
    group: null,
    repeatCount: null,
    didTryAutoLogin: false,
    isFirstLaunch: undefined,
}


export default (state = initialState, action) => {
    switch (action.type) {
        case AUTHENTICATE:
            return {
                ...state,
                token: action.token,
                userId: action.userId,
                group: action.group,
                repeatCount: action.repeats
            }
        case SET_DID_TRY_AL:
            return {
                ...state,
                didTryAutoLogin: true
            }

        case SET_IS_FIRST_LAUNCH:
            return {
                ...state,
                isFirstLaunch: action.val,
                didCheckFirstLaunch: true
            }
        case LOGOUT:
            return initialState

        default: return state
    }
}

import {AUTHENTICATE, LOGOUT, SET_DID_TRY_AL, SET_IS_FIRST_LAUNCH, SET_PUSH_TOKEN,SET_FINISHED_BOARDING} from '../actions/auth'

const initialState = {
    token: null,
    userId: null,
    group: null,
    didTryAutoLogin: false,
    isFirstLaunch: undefined,
    pushToken: ''
}


export default (state = initialState, action) => {
    switch (action.type) {
        case AUTHENTICATE:
            return {
                ...state,
                token: action.token,
                userId: action.userId,
                group: action.group
            }
        case SET_DID_TRY_AL:
            return {
                ...state,
                didTryAutoLogin: true
            }
        case SET_IS_FIRST_LAUNCH:
            return  {
                ...state,
                isFirstLaunch: action.val,
            }
        case SET_FINISHED_BOARDING:
            return {
                ...state,
                isFirstLaunch: false
            }

        case SET_PUSH_TOKEN:
            return {
                ...state,
                pushToken: action.token
            }
        case LOGOUT:
            return initialState

        default: return state
    }
}

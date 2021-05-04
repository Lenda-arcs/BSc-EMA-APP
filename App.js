// import './helpers/wdyr'

import React, {useMemo, useState, useEffect, useRef} from 'react';
import {LogBox, Vibration} from 'react-native'
import {createStore, combineReducers, applyMiddleware} from "redux";
import {Provider, useDispatch} from 'react-redux'
import ReduxThunk from 'redux-thunk'
import {Provider as PaperProvider} from 'react-native-paper'
import * as Notifications  from 'expo-notifications'


import assessmentReducer from "./store/reducers/assessment";
import authReducer from "./store/reducers/auth"


import AppNavigator from "./navigation/AppNavigator";

import PreferencesContext from "./navigation/PreferencesContext";
import * as Theme from './constants/CtmThemes'
import {getItemAsyncStore, saveItemAsyncStore, deleteItemAsyncStore} from "./helpers/asyncStoreFactories";
import {calcResTime} from "./helpers/notificationHandler";


const PREFERENCES_KEY = 'APP_PREFERENCES';

Notifications.setNotificationHandler({
    handleNotification: async () => {
        return {
            shouldShowAlert: true,
            shouldSetBadge: true,
            shouldPlaySound: true
        }
    }
})

LogBox.ignoreLogs(['ReactNative.NativeModules.LottieAnimationView'])


const rootReducer = combineReducers({
    // toDo: refactor name to store ?
    assessment: assessmentReducer,
    auth: authReducer,
})

const store = createStore(rootReducer, applyMiddleware(ReduxThunk))

// todo: make class component!
export default function App() {

    const [notificationState, setNotificationState] = useState(null) //todo: handle notifications
    const notificationListener = useRef()
    const responseListener = useRef()
    const [theme, setTheme] = useState(Theme.CustomDefaultTheme);

    const _handleNotification = notification => {
        Vibration.vibrate();
        setNotificationState({...notificationState, not: {...notification}});
    };

    const _handleNotificationRes = response => {
        setNotificationState({...notificationState, res: {...response}})
    }

   useEffect(() => {
       notificationListener.current = Notifications.addNotificationReceivedListener(note => _handleNotification(note))
       responseListener.current = Notifications.addNotificationResponseReceivedListener(res => _handleNotificationRes(res))

       return () => {
           Notifications.removeNotificationSubscription(notificationListener.current)
           Notifications.removeNotificationSubscription(responseListener.current)
       }
   }, [])




    useEffect(() => {
        const restorePrefs = async () => {
            try {
                const preferences = await getItemAsyncStore(PREFERENCES_KEY, undefined, true);
                if (preferences) {setTheme(preferences.theme === 'dark' ? Theme.CustomDarkTheme : Theme.CustomDefaultTheme)}
            } catch (e) {
                // ignore error
            }
        };
        restorePrefs();
    }, []);

    useEffect(() => {
        const savePrefs = async () => {
            try {
                await saveItemAsyncStore(PREFERENCES_KEY, {theme: theme === Theme.CustomDarkTheme ? 'dark' : 'light'});
            } catch (e) {
                // ignore error
            }
        };

        savePrefs();
    }, [theme]);

    const preferences = useMemo(
        () => ({
            toggleTheme: () =>
                setTheme(theme => (theme === Theme.CustomDefaultTheme ? Theme.CustomDarkTheme : Theme.CustomDefaultTheme))
            ,theme
        }),
        [theme]
    );



    return (
        <Provider store={store}>
            <PaperProvider theme={theme}>
                <PreferencesContext.Provider value={preferences} >
                    <AppNavigator notification={notificationState}/>
                </PreferencesContext.Provider>
            </PaperProvider>
        </Provider>

    );


}


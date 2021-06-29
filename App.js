import React, {useMemo, useState, useEffect, useRef} from 'react';
import {LogBox, Vibration, I18nManager} from 'react-native'
import {createStore, combineReducers, applyMiddleware} from "redux";
import {Provider} from 'react-redux'
import ReduxThunk from 'redux-thunk'
import {Provider as PaperProvider} from 'react-native-paper'
import * as Notifications  from 'expo-notifications'


import assessmentReducer from "./store/reducers/assessment";
import authReducer from "./store/reducers/auth"


import AppNavigator from "./navigation/AppNavigator";

import PreferencesContext from "./navigation/PreferencesContext";
import * as Theme from './constants/ownThemes'
import {getItemAsyncStore, saveItemAsyncStore} from "./helpers/asyncStoreFactories";

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
    const [rtl, setRtl] = useState(I18nManager.isRTL)

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
                if (preferences) {
                    setTheme(preferences.theme === 'dark' ? Theme.CustomDarkTheme : Theme.CustomDefaultTheme)

                    if (typeof preferences.rtl === 'boolean') setRtl(preferences.rtl)
                }
            } catch (e) {
                // ignore error
            }
        };
        restorePrefs();
    }, []);

    useEffect(() => {
        const savePrefs = async () => {
            try {
                await saveItemAsyncStore(PREFERENCES_KEY, {theme: theme === Theme.CustomDarkTheme ? 'dark' : 'light', rtl});
            } catch (e) {
                // ignore error
            }
            if (I18nManager.isRTL !== rtl) {
                I18nManager.forceRTL(rtl)
                // Updates.()
            }
        };

        savePrefs();
    }, [theme, rtl]);

    const preferences = useMemo(
        () => ({
            toggleTheme: () =>
                setTheme(theme => (theme === Theme.CustomDefaultTheme ? Theme.CustomDarkTheme : Theme.CustomDefaultTheme)),
            toggleRtl: () => setRtl(rtl => !rtl)
            ,theme
            ,rtl
        }),
        [theme, rtl]
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


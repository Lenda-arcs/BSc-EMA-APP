// import './helpers/wdyr'

import React , {useMemo, useState, useEffect} from 'react';
import {createStore, combineReducers, applyMiddleware} from "redux";
import {Provider} from 'react-redux'
import ReduxThunk from 'redux-thunk'
import {Provider as PaperProvider} from 'react-native-paper'


import AsyncStorage from '@react-native-async-storage/async-storage'

import assessmentReducer from "./store/reducers/assessment";
import authReducer from "./store/reducers/auth"


import AppNavigator from "./navigation/AppNavigator";

import PreferencesContext from "./navigation/PreferencesContext";
import * as Theme from './constants/CtmThemes'
import {getItemAsyncStore, saveItemAsyncStore, deleteItemAsyncStore} from "./helpers/asyncStoreFactories";


const PREFERENCES_KEY = 'APP_PREFERENCES';


import { LogBox } from 'react-native'
LogBox.ignoreLogs(['ReactNative.NativeModules.LottieAnimationView'])


const rootReducer = combineReducers({
    // toDo: refactor name to store ?
    assessment: assessmentReducer,
    auth: authReducer,
})

const store = createStore(rootReducer, applyMiddleware(ReduxThunk))


// todo: refactor asyncStorage functions
export default function App() {
  //  useKeepAwake()


    const [theme, setTheme] = useState(Theme.CustomDefaultTheme);


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
                    <AppNavigator />
                </PreferencesContext.Provider>
            </PaperProvider>
        </Provider>

    );


}


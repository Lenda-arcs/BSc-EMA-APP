// import './helpers/wdyr'

import React , {useMemo, useState, useEffect} from 'react';
import {createStore, combineReducers, applyMiddleware} from "redux";
import {Provider} from 'react-redux'
import ReduxThunk from 'redux-thunk'
import {Provider as PaperProvider} from 'react-native-paper'


import AsyncStorage from '@react-native-async-storage/async-storage'


import assessmentsReducer from "./store/reducers/assessment";
import authReducer from "./store/reducers/auth"
// import {init} from "./helpers/db";

import AppNavigator from "./navigation/AppNavigator";

import PreferencesContext from "./navigation/PreferencesContext";
import * as Theme from './constants/CtmThemes'


const PREFERENCES_KEY = 'APP_PREFERENCES';

//
//
// init().then(() => {
//     //console.log('Initialized database')
// }).catch(err => {
//     console.log('Initializing database failed')
//     throw err
// });





const rootReducer = combineReducers({
    // toDo: refactor name to store ?
    assessments: assessmentsReducer,
    auth: authReducer,
})

const store = createStore(rootReducer, applyMiddleware(ReduxThunk))



export default function App() {
  //  useKeepAwake()


    const [theme, setTheme] = useState(Theme.CustomDefaultTheme);



    useEffect(() => {
        const restorePrefs = async () => {
            try {
                const prefString = await AsyncStorage.getItem(PREFERENCES_KEY);
                const preferences = JSON.parse(prefString || '');

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
                await AsyncStorage.setItem(PREFERENCES_KEY,
                    JSON.stringify({theme: theme === Theme.CustomDarkTheme ? 'dark' : 'light'}));
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


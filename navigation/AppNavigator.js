import React, {useEffect} from 'react'
import {useDispatch, useSelector} from "react-redux";

import {Appbar} from "react-native-paper";
import {NavigationContainer, DrawerActions, getFocusedRouteNameFromRoute} from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {createDrawerNavigator} from "@react-navigation/drawer";

import PreferencesContext from "./PreferencesContext";
import * as Theme from '../constants/CtmThemes'


import StartupScreen from "../screens/StartupScreen";
import HomeScreen from "../screens/HomeScreen";
import FeedbackScreen from "../screens/FeedbackScreen";
import AdminScreen from "../screens/AdminScreen";
import AssessmentScreen from "../screens/AssessmentScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import AuthScreen from "../screens/AuthScreen";
import DrawerItems from './DrawerItems'
import {setNotificationState} from "../store/actions/assessment";



const Drawer = createDrawerNavigator()
const AssessStack = createStackNavigator()


const DrawerContent = ({navigation}) => {
    const {token, user} = useSelector(state => state.auth)
    return (
        <PreferencesContext.Consumer>
            {preferences => (
                <DrawerItems
                    toggleTheme={preferences.toggleTheme}
                    isDarkTheme={preferences.theme === Theme.CustomDarkTheme}
                    authStatus={token}
                    userType={user.role}
                    navigation={navigation}
                />
            )}
        </PreferencesContext.Consumer>
    );
};


const CustomNavigationBar = ({navigation, previous, scene, title}) => {
    return (
        <Appbar.Header>
            {previous ? <Appbar.BackAction onPress={navigation.goBack}/> : null}
            {
                scene.route.name === 'Home'
                    ? <Appbar.Action icon={'menu'} onPress={() => {
                        navigation.dispatch(DrawerActions.toggleDrawer())
                    }}/>
                    : null
            }
            <Appbar.Content title={title}/>
        </Appbar.Header>
    )
}

const defaultNavOptions = {
    header: ({scene, navigation, previous}) => {
        const {options} = scene.descriptor
        const title =
            options.headerTitle !== undefined
                ? options.headerTitle
                : options.title !== undefined
                ? options.title
                : scene.route.name
        return <CustomNavigationBar previous={previous} scene={scene} navigation={navigation} title={title}/>
    }
}


function getHeaderTitle(route) {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';

    switch (routeName) {
        case 'Home':
            return 'Studie: iViewSky'
        case 'Feedback':
            return 'Feedback'
        case 'Admin':
            return 'Admin'
        default:
            return 'default'
    }
}


const Home = () => {
    return (
        <Drawer.Navigator screenOptions={defaultNavOptions}
                          drawerContent={({navigation}) => <DrawerContent navigation={navigation}/>}>
            <Drawer.Screen name='Home' component={HomeScreen}/>

        </Drawer.Navigator>
    )
}



const AssessmentNavigator = ({isAuth, isFirstLaunch}) => {
    return (
        <AssessStack.Navigator screenOptions={defaultNavOptions}>

            {isFirstLaunch && !isAuth &&
            <AssessStack.Screen name='Boarding' component={OnboardingScreen} options={{headerShown: false}}/>}
            {isAuth
                ? <>
                    <AssessStack.Screen name='Home' component={Home}
                                        options={({route}) => ({headerTitle: getHeaderTitle(route)})}/>
                    <AssessStack.Screen name='Assessment' component={AssessmentScreen}
                                        options={{headerTitle: `Befragung`}}/>
                    {/*<AssessStack.Screen name='Feedback' component={FeedbackScreen}/>*/}
                    <AssessStack.Screen name='Admin' component={AdminScreen}/>
                </>
                : <AssessStack.Screen name='Auth' component={AuthScreen} options={{headerShown: false}}/>}

        </AssessStack.Navigator>
    )
}

const AppNavigator = (props) =>
{
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setNotificationState(props.notification))
    }, [props])

    const isAuth = useSelector(state => !!state.auth.token)
    const didTryAutoLogin = useSelector(state => !!state.auth.didTryAutoLogin)
    const isFirstLaunch = useSelector(state => !!state.auth.isFirstLaunch);

    return (
        <NavigationContainer>
            {!didTryAutoLogin && !isAuth
                ? <StartupScreen/>
                : <AssessmentNavigator isFirstLaunch={isFirstLaunch} isAuth={isAuth}/>}

        </NavigationContainer>


    )
}

export default AppNavigator

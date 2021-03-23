import React from 'react'
import {useSelector} from "react-redux";

import {Appbar} from "react-native-paper";
import {NavigationContainer, DrawerActions, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import {createStackNavigator} from "@react-navigation/stack";
import {createDrawerNavigator} from "@react-navigation/drawer";

import PreferencesContext from "./PreferencesContext";
import * as Theme from '../constants/CtmThemes'


import StartupScreen from "../screens/StartupScreen";
import HomeScreen from "../screens/HomeScreen";
import AssessmentScreen from "../screens/AssessmentScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import AuthScreen from "../screens/AuthScreen";
import DrawerItems from './DrawerItems'




const Drawer = createDrawerNavigator()
const AssessStack = createStackNavigator()




const DrawerContent = ({navigation}) => {
    const isAuth = useSelector(state => !!state.auth.token)
    return (
        <PreferencesContext.Consumer>
            {preferences => (
                <DrawerItems
                    toggleTheme={preferences.toggleTheme}
                    isDarkTheme={preferences.theme === Theme.CustomDarkTheme}
                    authStatus={isAuth}
                    navigation={navigation}
                />
            )}
        </PreferencesContext.Consumer>
    );
};


const CustomNavigationBar = ({navigation, previous, scene, title} ) => {
    return (
        <Appbar.Header >
            {previous ? <Appbar.BackAction onPress={navigation.goBack}/> : null}
            {
                scene.route.name === 'Home'
                ? <Appbar.Action icon={'menu'} onPress={() => {navigation.dispatch(DrawerActions.toggleDrawer())}} />
                : null
            }
            <Appbar.Content title={title}/>
        </Appbar.Header>
    )
}

const defaultNavOptions = {
    header: ({scene, navigation,  previous}) => {
        const {options} = scene.descriptor
        const title =
            options.headerTitle !== undefined
            ? options.headerTitle
            : options.title !== undefined
                ? options.title
                : scene.route.name
        return <CustomNavigationBar previous={previous} scene={scene} navigation={navigation} title={title} />
    }
}



function getHeaderTitle(route) {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';

    switch (routeName) {
        case 'Home':
            return 'Home'
        case 'Auth':
            return 'Anmelden'
        default:
            return 'default'
    }
}


const Home = () => {
    return (
        <Drawer.Navigator screenOptions={defaultNavOptions} drawerContent={({navigation }) => <DrawerContent navigation={navigation}/>} >
            <Drawer.Screen name='Home' component={HomeScreen} />
            <Drawer.Screen name='Auth' component={AuthScreen} options={{title: 'Anmelden'}}/>
        </Drawer.Navigator>
    )
}


const AssessmentNavigator = ({fistLaunch}) => {
    return (
        <AssessStack.Navigator  screenOptions={defaultNavOptions}>
            {fistLaunch
                ? <AssessStack.Screen name='Onboarding' component={OnboardingScreen} options={{headerShown: false}}/>
                : <AssessStack.Screen name='Home' component={Home}
                                      options={ ({ route }) =>
                                          ({headerTitle: getHeaderTitle(route)})}/>}

            <AssessStack.Screen name='Assessment' component={AssessmentScreen}/>

            {/* For Testing */}
            {/*<AssessStack.Screen name='Onboarding' component={OnboardingScreen} options={{headerShown: false}}/>*/}
        </AssessStack.Navigator>
    )
}


const AppNavigator = () => {
    const isAuth = useSelector(state => !!state.auth.token)
    const didTryAutoLogin = useSelector(state => !!state.auth.didTryAutoLogin);
    const isFirstLaunch = useSelector(state => !!state.auth.isFirstLaunch);
    const assessmentCount = useSelector(state => state.assessments.assessmentCount)



    return (
            <NavigationContainer>
                {!isAuth && !didTryAutoLogin
                    ? <StartupScreen/>
                    : <AssessmentNavigator fistLaunch={isFirstLaunch} count={assessmentCount}/>}

            </NavigationContainer>


    )
}

export default AppNavigator

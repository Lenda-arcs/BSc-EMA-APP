import React from 'react';
import {View, SafeAreaView, StatusBar} from 'react-native';
import {withTheme} from "react-native-paper";


let CtmView



const Screen = props => {
    const {colors, dark} = props.theme
    const { darkContent, noSaveArea , barColor } = props

    noSaveArea ? CtmView = View : CtmView = SafeAreaView


    return (
        <CtmView style={{backgroundColor: colors.background, flex: 1, ...props.style}}>
            <StatusBar  animated={true} translucent={true}
                        backgroundColor={dark ? '#252525' : noSaveArea ? colors.background : '#0261A1'}
                        barStyle={darkContent && !dark ? 'dark-content' : 'light-content'} />
            {props.children}
        </CtmView>)
};


export default withTheme(Screen);

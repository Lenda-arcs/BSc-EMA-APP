import React from 'react';
import {View} from 'react-native';
import {withTheme} from "react-native-paper";
import {StatusBar} from "expo-status-bar";

const Screen = props => {
    const {colors} = props.theme
    const {dark} = props.theme

    return (<View style={{backgroundColor: colors.background, flex: 1, ...props.style}}>
        <StatusBar backgroundColor={dark ? colors.background : colors.primary} barStyle='light-content' />
        {props.children}
    </View>)
};


export default withTheme(Screen);

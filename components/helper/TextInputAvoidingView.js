import {KeyboardAvoidingView, Platform} from "react-native";
import React from "react";


const TextInputAvoidingView = ({children}) => {
    return Platform.OS === 'ios'
        ? (<KeyboardAvoidingView style={styles.wrapper} behavior='padding' keyboardVerticalOffset={80}>
            {children}
        </KeyboardAvoidingView>)
        : <>{children}</>
}


export default TextInputAvoidingView
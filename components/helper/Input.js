import React, {useReducer, useEffect, useState} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {TextInput, withTheme, HelperText} from 'react-native-paper'

import CtmDialog from "./CtmDialog";

const INPUT_CHANGE = 'INPUT_CHANGE';
const INPUT_BLUR = 'INPUT_BLUR';

const inputReducer = (state, action) => {
    switch (action.type) {
        case INPUT_CHANGE:
            return {
                ...state,
                value: action.value,
                isValid: action.isValid
            };
        case INPUT_BLUR:
            return {
                ...state,
                touched: true
            };
        default:
            return state;
    }
};

const Input = props => {
    const [inputState, dispatch] = useReducer(inputReducer, {
        value: props.initialValue ? props.initialValue : '',
        isValid: props.initiallyValid,
        touched: false
    });

    const {onInputChange, id} = props

    const {colors} = props.theme

    const [dialogVisible, setDialogVisible] = useState(false)
    const showDialog = () => setDialogVisible(true)
    const hideDialog = () => setDialogVisible(false)

    useEffect(() => {
        if (inputState.touched) onInputChange(id, inputState.value, inputState.isValid);
    }, [inputState, onInputChange, id]);

    const textChangeHandler = text => {

        const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        // toDo: Regex for participants id --> could be more specific
        const userIdRegex = /[0-9]/

        let isValid = true;

        if (props.required && text.trim().length === 0) isValid = false
        if (props.email && !emailRegex.test(text.toLowerCase())) isValid = false
        if (props.userId && !userIdRegex.test(text)) isValid = false
        if (props.min != null && +text < props.min) isValid = false
        if (props.max != null && +text > props.max) isValid = false;
        if (props.minLength != null && text.length < props.minLength) isValid = false;

        dispatch({type: INPUT_CHANGE, value: text, isValid: isValid});
    };

    const lostFocusHandler = () => {
        dispatch({type: INPUT_BLUR});
    };

    return (
        <View style={styles.formControl}>
            {/* for validation maybe works also with text-input-mask */}

            <TextInput {...props} mode={props.mode ? props.mode : 'flat'}
                       style={{backgroundColor: colors.background, width: '90%', ...props.style}}
                       label={props.label}
                       value={inputState.value}
                       onChangeText={textChangeHandler}
                       onBlur={lostFocusHandler}
                       error={!inputState.isValid && inputState.touched}
                       right={
                           <TextInput.Icon
                               name={ props.icon }
                               onPress={showDialog}
                               size={20}
                               forceTextInputFocus={false}
                           />
                       }/>
            {
                !inputState.isValid && inputState.touched &&
                (<HelperText style={{alignSelf: 'flex-start', marginLeft: 12}} type='error'>{props.errorText}</HelperText>)
            }
            <CtmDialog visible={dialogVisible} showDialog={showDialog} hideDialog={hideDialog} helpText={props.helpText}
                       title='Eingabehilfe'/>
        </View>
    );
};
const screenWidth = Dimensions.get('window').width
const styles = StyleSheet.create({
    formControl: {
        width: screenWidth / 100 * 70 ,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    label: {
        marginVertical: 8
    },
    input: {
        paddingHorizontal: 2,
        paddingVertical: 5,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    }
});

export default withTheme(Input);

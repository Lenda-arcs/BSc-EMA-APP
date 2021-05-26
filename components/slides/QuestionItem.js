import React, {useCallback, useEffect, useReducer, useState} from 'react'
import {StyleSheet, View, Text} from "react-native";
import {RadioButton, Divider, List, withTheme} from 'react-native-paper'

import DateTimePicker from '@react-native-community/datetimepicker';

const QuestionItem = props => {
    const {colors, dark} = props.theme
    const {question, expanded ,resetExpanded} = props

    let preSelection = props?.selection
    if (preSelection === undefined) preSelection = null

    const [checked, setChecked] = useState(preSelection?.answerValue);
    const [icon, setIcon] = useState(preSelection ? 'check' : 'help-circle')


    const [date, setDate] = useState(new Date("1990-01-01"));
    const [show, setShow] = useState(true);


    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        if (Platform.OS !== 'ios') {
            setShow(false)
            resetExpanded()
        }
        setDate(currentDate);
        savePick(currentDate)

    };


    const savePick = (newValue) => {
        setChecked(newValue)
        props.onChange({
            domain: question.domain,
            questionId: question.id,
            answerValue: newValue
        })
        setIcon('check')

    }

    useEffect(() => {
        if (expanded === question._id && question?.selectionItems?.[0] === 'INPUT') setShow(true)
    },[expanded])

    return (
        <List.Accordion id={question._id}
                        style={icon !== 'check' && {borderLeftWidth: .6, borderColor: colors.accent}}
                        title={question.text}
                        titleNumberOfLines={3}
                        left={props => <List.Icon {...props} icon={icon}
                                                  color={icon !== 'check' ? colors.accent : colors.primary}/>}>
            {question?.selectionItems?.[0] === 'INPUT' ? show &&
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode='date'
                    is24Hour={true}
                    display="spinner"
                    onChange={onChange}
                    themeVariant={dark ? 'dark' : 'light'}
                />
                : <RadioButton.Group
                    onValueChange={newValue => savePick(newValue)}
                    value={checked}>
                    <View
                        style={{backgroundColor: dark ? '#252525' : '#fff', justifyContent: 'flex-start'}}>
                        {question?.selectionItems?.map((item, index) =>
                            <RadioButton.Item
                                key={index}
                                label={item}
                                value={index}
                                labelStyle={styles.label} mode='android'
                                style={styles.item}/>)}
                    </View>
                </RadioButton.Group>}

            <Divider/>
        </List.Accordion>
    )
}


const styles = StyleSheet.create({
    item: {
        marginRight: 6
    },
    label: {
        marginLeft: 10,
    }
})

export default withTheme(QuestionItem)

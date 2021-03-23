import React, { useState} from 'react'
import {StyleSheet, Platform, TouchableOpacity, TouchableNativeFeedback} from "react-native";
import {RadioButton, Divider, List} from 'react-native-paper'




const QuestionItem = props => {


    const questionId = props.question.id
    let preSelection = props?.selection
    if (preSelection === undefined) preSelection = null

    const [expanded, setExpanded] = useState(true)
    const [checked, setChecked] = useState(preSelection);
    const [icon, setIcon] = useState(preSelection ? 'check' : 'help-circle')

    let platform = Platform.OS === 'android' ? 'android' : 'ios'


    const handlePress = () => {
        setExpanded(!expanded)
    }
    const savePick = (newValue) => {
        setChecked(newValue)
        props.onChange({[questionId]: newValue})
        setIcon('check')

    }

    return (


        <List.Accordion id={props.id.toString()} title={props.text} titleNumberOfLines={2}
                        left={props => <List.Icon {...props} icon={icon}/>}
                        expanded={expanded} onPress={handlePress}
                        style={props.index % 2 == 0 ? styles.even : styles.odd}>
            <RadioButton.Group onValueChange={newValue => savePick(newValue)} value={checked}>
                {props.items.map((item, index) => <RadioButton.Item key={index} label={item} value={index}
                                                                    labelStyle={styles.label} mode={platform}/>)}
            </RadioButton.Group>
            <Divider/>
        </List.Accordion>
    )
}


const styles = StyleSheet.create({

    odd: {
        //  backgroundColor: '#EDEDED'

    },
    even: {
        // backgroundColor: '#FAFAFA',
    },
    label: {
        marginLeft: 10
    }
})

export default QuestionItem

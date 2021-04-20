import React, {useState} from 'react'
import {StyleSheet, View, TouchableOpacity, TouchableNativeFeedback} from "react-native";
import {RadioButton, Divider, List, withTheme} from 'react-native-paper'


const QuestionItem = props => {
    const {colors, dark} = props.theme

    let preSelection = props?.selection
    if (preSelection === undefined) preSelection = null

    const [expanded, setExpanded] = useState(true)
    const [checked, setChecked] = useState(preSelection?.answerValue);
    const [icon, setIcon] = useState(preSelection ? 'check' : 'help-circle')

    // todo: find better solution for ios unchecked items
    //let platform = Platform.OS === 'android' ? 'android' : 'ios'



    const handlePress = () => {
        setExpanded(!expanded)
    }
    const savePick = (newValue) => {
        setChecked(newValue)
        props.onChange({
            domain: props.domain,
            questionId: props.question.id,
            answerValue: newValue
        })
        setIcon('check')

    }

    return (


        <List.Accordion id={props.question._id} title={props.text} titleNumberOfLines={3}
                        left={props => <List.Icon {...props} icon={icon}/>}
                        expanded={expanded} onPress={handlePress}>
                <RadioButton.Group onValueChange={newValue => savePick(newValue)} value={checked}>
                    <View style={{minHeight: 200, backgroundColor: dark ? '#252525' : '#fff' , justifyContent: 'flex-start'}}>
                        {props.items.map((item, index) => <RadioButton.Item key={index} label={item} value={index}
                                                                            labelStyle={styles.label} mode='android'
                                                                            style={styles.item} />)}
                    </View>
                </RadioButton.Group>

            <Divider/>
        </List.Accordion>
    )
}


const styles = StyleSheet.create({
    item: {

    },
    label: {
        marginLeft: 10,
    }
})

export default withTheme(QuestionItem)

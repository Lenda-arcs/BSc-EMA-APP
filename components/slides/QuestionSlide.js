import React, {useCallback, useEffect, useState} from 'react'
import {View, StyleSheet} from "react-native";
import { List, withTheme} from "react-native-paper";

import CtmSubheading from "../wrapper/CtmSubheading";
import QuestionItem from "./QuestionItem";





const QuestionSlide = ({ domain, theme , questions, onSlideChange, savedSelection, isComplete ,description }) => {
    const [expandedId, setExpandedId] = useState(undefined);

    const onAccordionPressHandler = (newExpandedId) =>
        expandedId === newExpandedId
            ? setExpandedId(undefined)
            : setExpandedId(newExpandedId);


    const {colors} = theme


    const [state, setState] = useState('')

    // Get sizes
    const questionCount = questions.length
    let pickListCount = (state === '' || state?.[domain] === undefined || state?.[domain] === null) ? 0 : Object.keys(state?.[domain]).length

    useEffect(() => {
        //check if all questions has been answered
        if (questionCount === pickListCount) {
            onSlideChange(state)
            isComplete()
            //reset expanded question for next slide
            setTimeout(() => setExpandedId(undefined), 1500)
        }

    },[state])



    //update picks obj with each selection
    const onChangeHandler = (pickObj) => {
        if (state === '') setState({[domain]: {...pickObj}})
        else setState({...state, [domain]: {...state[domain], ...pickObj}})

    }





    return (
        <View style={{flex: 1}}>
            <CtmSubheading style={styles.label}>{description}</CtmSubheading>
            <List.AccordionGroup onAccordionPress={onAccordionPressHandler} expandedId={expandedId}>
                <View>
                    {questions.map((question, index) =>
                        <QuestionItem
                            key={question.id}
                            index={index}
                            id={index}
                            question={question}
                            text={question.text}
                            items={question.items}
                            onChange={onChangeHandler}
                            selection={state?.[domain]?.[question.id]}/>)}
                </View>
            </List.AccordionGroup>
        </View>
    )
};

const styles = StyleSheet.create({

    label: {

    },
})


export default withTheme(QuestionSlide)

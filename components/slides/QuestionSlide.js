import React, {useCallback, useEffect, useState} from 'react'
import {View, StyleSheet} from "react-native";
import {List, withTheme} from "react-native-paper";

import CtmSubheading from "../wrapper/CtmSubheading";
import QuestionItem from "./QuestionItem";


const QuestionSlide = ({slideName, theme, questions, onSlideChange, savedSelection, isComplete, description}) => {
    const {colors} = theme
    const [expandedId, setExpandedId] = useState(undefined);
    const [state, setState] = useState({
        slideName: '',
        answers: []
    })
    // Get question quantity
    const questionCount =  questions.length
    let pickListCount = state?.answers?.length

    const onAccordionPressHandler = (newExpandedId) =>
        expandedId === newExpandedId
            ? setExpandedId(undefined)
            : setExpandedId(newExpandedId);





    // Checking as complete if user goes to prev slide
    useEffect(() => {
        if (savedSelection?.length) setState({slideName: slideName, answers: savedSelection})
        else setState({slideName: slideName, answers: []})
    }, [slideName])

    // Setting slide complete and uplift state
    useEffect(() => {
        //check if all questions has been answered
        if ( questionCount <= pickListCount ) {
            onSlideChange(state)
            isComplete()
        }

    }, [state])



    //update picks obj with each item selection
    const onChangeHandler = (pickObj) => {

        let objIndex = state.answers.findIndex(el => (el.domain === pickObj.domain) && (el.questionId === pickObj.questionId))

        if (objIndex < 0) setState({...state, answers: state.answers.concat(pickObj)})
        else {
            let arrCopy = [...state.answers]
            arrCopy[objIndex] = pickObj
            setState({...state, answers: arrCopy})
        }
    }


    return (
        <View style={{flex: 1}}>
            <CtmSubheading>{description}</CtmSubheading>
            <List.AccordionGroup onAccordionPress={onAccordionPressHandler} expandedId={expandedId}>
                <View>
                    {questions.map((question) =>
                        <QuestionItem
                            key={question._id}
                            domain={question.domain}
                            question={question}
                            text={question.text}
                            items={question.selectionItems}
                            onChange={onChangeHandler}
                            selection={savedSelection?.find(q => q.questionId === question.id && q.domain === question.domain)}/>)}
                </View>
            </List.AccordionGroup>
        </View>
    )
};





export default withTheme(QuestionSlide)

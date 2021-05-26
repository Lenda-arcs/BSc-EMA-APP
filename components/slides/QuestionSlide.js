import React, {useEffect, useState} from 'react'
import {ScrollView} from "react-native";
import {List, withTheme} from "react-native-paper";

import CtmSubheading from "../wrapper/CtmSubheading";
import QuestionItem from "./QuestionItem";


const QuestionSlide = props => {
    const {slideName, questions, onSlideChange, savedSelection, isComplete, description} = props
    const [expandedId, setExpandedId] = useState(undefined);
    const [state, setState] = useState({
        slideName: '',
        answers: []
    })
    const questionCount =  questions.length
    let pickListCount = state?.answers?.length

    const onAccordionPressHandler = (newExpandedId) =>
        expandedId === newExpandedId
            ? setExpandedId(undefined)
            : setExpandedId(newExpandedId);

    const resetExpandedHandler = () => {
        setExpandedId(undefined)
    }

    // Checking as complete if user goes to prev slide
    useEffect(() => {
        if (savedSelection?.length) setState({slideName: slideName, answers: savedSelection})
        else setState({slideName: slideName, answers: []})
    }, [slideName])

    // Setting slide complete and uplift state
    useEffect(() => {
        //check if all questions has been answered
        if ( questionCount <= pickListCount ) {
            // resetExpandedHandler() //todo: needs different approach
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
        <ScrollView contentContainerStyle={{paddingBottom: 30}} >
            <CtmSubheading>{description}</CtmSubheading>
            <List.AccordionGroup onAccordionPress={onAccordionPressHandler} expandedId={expandedId}>
                    {questions.map((question) =>
                        <QuestionItem
                            key={question._id}
                            expanded={expandedId}
                            question={question}
                            onChange={onChangeHandler}
                            resetExpanded={resetExpandedHandler}
                            selection={savedSelection?.find(q => q.questionId === question.id && q.domain === question.domain)}/>)}
            </List.AccordionGroup>
        </ScrollView>
    )
};





export default withTheme(QuestionSlide)

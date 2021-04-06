import React, {useCallback, useRef, useState} from 'react'
import {View, StyleSheet, ScrollView, Text} from "react-native";
import { withTheme} from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";

import Wizard from 'react-native-wizard'
import * as actions from '../store/actions/assessment'


import Screen from "../components/wrapper/Screen";
import QuestionSlide from "../components/slides/QuestionSlide";
import PictureSlide from "../components/slides/PictureSlide";
import Stepper from "../components/helper/Stepper";
import CtmButton from "../components/wrapper/CtmButton";
import SuccessAnimation from "../components/helper/SuccessAnimation";



const AssessmentScreen = props => {
    //
    const [isFetching, setIsFetching] = useState(false)
    // modal specs
    const [visible, setVisible] = useState(false);
    // wizard
    const wizard = useRef()
    const [isFirstStep, setIsFirstStep] = useState(true)
    const [isLastStep, setIsLastStep] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    // Validation
    const [slideComplete, setSlideComplete] = useState(false)

    const [time, setTime] = useState({
        start: new Date(),
        end: null
    })
    // images
    const [selectedSkyImage, setSelectedSkyImage] = useState()
    const [selectedHorizonImage, setSelectedHorizonImage] = useState()
    const [userLoc, setUserLoc] = useState()

    // picks
    const [selection, setSelection] = useState([ ])

    // getting assessment data from store
    const allQuestionsSlides = useSelector(state => state.assessments.availableSlides)

    // current user progress
    const userProgress = useSelector(state => state.assessments.assessmentCount)

    // destructure color prop form withTheme wrapper
    const {colors} = props.theme

    const dispatch = useDispatch()

    // PicSlide complete setter
    const isPicSlideCompleteHandler = (skyImage, horizonImage, userLoc) => {
        setSelectedSkyImage(skyImage)
        setSelectedHorizonImage(horizonImage)
        setUserLoc(userLoc)
        setSlideComplete(true)
    }

    // QuestionSlide complete setter
    const isSlideCompleteHandler = () => {
        setSlideComplete(true)
    }

    // storing slide selections in total selection state  todo: use useCallback again
    const onSlideChangeHandler =  (slideSelection) => {
        let objIndex = selection.findIndex(el => (el.slideName === slideSelection.slideName))

        if (objIndex < 0) setSelection(selection.concat(slideSelection))
        else {
            let arrCopy = [...selection]
            arrCopy[objIndex] = slideSelection
            setSelection(arrCopy)
        }
    }


    const pictureSlide = {
        content: <PictureSlide isComplete={isPicSlideCompleteHandler}
                               savedData={{sky: selectedSkyImage, horizon: selectedHorizonImage}}/>
    }
    const stepList =
        allQuestionsSlides?.map((slide) => ({
            content:
                <QuestionSlide isLastStep={isLastStep} isComplete={isSlideCompleteHandler}
                               onSlideChange={onSlideChangeHandler}
                               questions={slide.questions}
                               slideName={slide.name}
                               description={slide.description}
                               savedSelection={selection?.find(sl => sl.slideName === slide.name)?.answers}
                />

        }))


    // Dismiss demographic data slide
    if (userProgress > 0) stepList.shift()
    // Dismiss effect question slide
    if (userProgress > 0 && userProgress !== 29) stepList.pop()


    // Append PictureSlide to assessment
    const userGroup  = useSelector(state => state.auth.group)
    userGroup === 'A' ?  stepList.unshift(pictureSlide) : stepList.push(pictureSlide)






    const submitHandler = () => {

        // creating timeobj to get duration of user interaction
        // calc duration on server
        const endTime = new Date()
        setTime(time.end = endTime)

        dispatch(actions.saveAssessment(selectedSkyImage.base64, selectedHorizonImage.base64, time, selection, userLoc, studyCount))
        showModal()
    }

    const showModal = () => {
        setVisible(true);

        // show success animation for certain time
        setTimeout(() => {
            setVisible(false)
            props.navigation.replace('Home')
            // maybe do it after sending the data
        }, 3000)
    }


    return (
        <Screen>
                    <ScrollView style={{flex: 1, width: '100%', backgroundColor: colors.background}}>
                        {/* Wizard component that takes question and picture slide - stepList */}
                        <Wizard useNativeDriver={true} prevStepAnimation='fade' nextStepAnimation='fade'
                                onPrev={() => {}}
                                isFirstStep={val => setIsFirstStep(val)}
                                isLastStep={val => setIsLastStep(val)} ref={wizard} steps={stepList}
                                currentStep={({currentStep, isLastStep, isFirstStep}) => {
                                    setCurrentStep(currentStep)
                                }}/>
                    </ScrollView>
                    <View style={{backgroundColor: colors.background, ...styles.btnGroup}}>
                        {/* USE FOR PRODUCTION */}
                        <CtmButton disabled={isFirstStep}
                                   icon='arrow-left' mode='text'
                                   onPress={() => wizard.current.prev()}>Zurück
                        </CtmButton>
                        {/*<CtmButton*/}
                        {/*           icon='arrow-left' mode='text'*/}
                        {/*           onPress={() => {*/}
                        {/*               isFirstStep ? props.navigation.replace('Home') : wizard.current.prev()*/}
                        {/*           }}>Zurück*/}
                        {/*</CtmButton>*/}
                        <Stepper currentStep={currentStep}
                                 stepList={stepList}/>
                        {isLastStep
                            ? (<CtmButton iconRight={true}
                                          icon='check' disabled={!slideComplete} mode='text'
                                          onPress={submitHandler}>Senden</CtmButton>)
                            : (<CtmButton iconRight={true} disabled={!slideComplete}
                                         icon='arrow-right' mode='text'
                                         onPress={() => {
                                           setSlideComplete(false)
                                           setIsFirstStep(true)
                                           wizard.current.next()}}>Weiter</CtmButton>)
                        }
                    </View>
            {/* Will be rendered if data submit is successful */}
            <SuccessAnimation visible={visible}/>
        </Screen>


    )
};

const styles = StyleSheet.create({

    btnGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 15,

    },
})


export default withTheme(AssessmentScreen)

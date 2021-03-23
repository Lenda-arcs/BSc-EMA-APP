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
        end: null,
        date: new Date().toLocaleDateString(),
        duration: null
    })
    // images
    const [selectedSkyImage, setSelectedSkyImage] = useState()
    const [selectedHorizonImage, setSelectedHorizonImage] = useState()
    const [userLoc, setUserLoc] = useState()

    // picks
    const [selection, setSelection] = useState('')

    // getting assessment data from store
    const allQuestionsSlides = useSelector(state => state.assessments.availableSlides)


    const { studyCount } = props.route.params
    console.log(studyCount)

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

    // storing slide selections in total selection state
    const onSlideChangeHandler =  useCallback((slideSelection) => {
        if (selection === '') setSelection({...slideSelection})
        else setSelection({...selection, ...slideSelection})

    },[selection])

    const goBackSlideHandler = () => {
        setSlideComplete(true)
    }

    const goNextSlideHandler = () => {

    }

    const pictureSlide = {
        content: <PictureSlide isComplete={isPicSlideCompleteHandler}
                               savedData={{sky: selectedSkyImage, horizon: selectedHorizonImage}}/>
    }
    const stepList =
        allQuestionsSlides?.map(slide => ({
            content:
                <QuestionSlide isLastStep={isLastStep} isComplete={isSlideCompleteHandler}
                               onSlideChange={onSlideChangeHandler}
                               questions={slide.questions}
                               domain={slide.domain}
                               description={slide.description}
                               savedSelection={selection?.domain}
                />

        }))
    // Dismiss demographic data slide
    if (studyCount > 0) stepList.shift()

    // Append PictureSlide to assessment
    stepList.unshift(pictureSlide)




    const submitHandler = () => {
        // User feedback (Activityindicator)
        setIsFetching(true)

        // creating timeobj to get duration of user interaction
        const endTime = new Date()
        setTime(time.end = endTime)

        // get duration in seconds
        // maybe update it with setInterval and check  if its in valid time range
        const duration = Math.round((time.end.getTime() - time.start.getTime()) / 1000 % 60)
        setTime(time.duration = duration)

        dispatch(actions.addAssessment(selectedSkyImage.base64, selectedHorizonImage.base64, time, selection, userLoc, studyCount))
        setIsFetching(false)
        showModal()
    }

    const showModal = () => {
        setVisible(true);

        // show success animation for certain time
        setTimeout(() => {
            setVisible(false)

            //
            props.navigation.replace('Home')
            // maybe do it after sending the data
        }, 3000)
    }


    return (
        <Screen>
                    <ScrollView style={{flex: 1, width: '100%', backgroundColor: colors.background}}>
                        {/* Wizard component that takes question and picture slide - stepList */}
                        <Wizard useNativeDriver={true} prevStepAnimation='fade' nextStepAnimation='fade'
                                onPrev={goBackSlideHandler}
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

import React, {useCallback, useEffect, useRef, useState} from 'react'
import {View, StyleSheet, ScrollView} from "react-native";
import {withTheme} from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";
import Wizard from 'react-native-wizard'


// Components
import Screen from "../components/wrapper/Screen";
import QuestionSlide from "../components/slides/QuestionSlide";
import PictureSlide from "../components/slides/PictureSlide";
import Stepper from "../components/helper/Stepper";
import CtmButton from "../components/wrapper/CtmButton";
import SuccessAnimation from "../components/helper/SuccessAnimation";

// Functions
import {saveAssessment} from '../store/actions/assessment'


const AssessmentScreen = props => {
    // state to show activity indicator while fetching data
    const [isFetching, setIsFetching] = useState(false)
    const [error, setError] = useState(false)

    // state to show modal
    const [visible, setVisible] = useState(false);

    // wizard
    const wizard = useRef(null)
    const [slides, setSlides] = useState([])
    const [isFirstStep, setIsFirstStep] = useState(true)
    const [isLastStep, setIsLastStep] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    // Validation
    const [slideComplete, setSlideComplete] = useState(false)


    // states for picture and location
    const [selectedSkyImage, setSelectedSkyImage] = useState()
    const [selectedHorizonImage, setSelectedHorizonImage] = useState()
    const [time, setTime] = useState({start: new Date() + 2})
    //  const [userLoc, setUserLoc] = useState()

    // state for user selection
    const [selection, setSelection] = useState([])


    // destructure color prop form withTheme wrapper
    const {colors} = props.theme


    // QuestionSlide complete setter
    const isSlideCompleteHandler = () => {
        setSlideComplete(true)
    }
    // PicSlide complete setter
    const isPicSlideCompleteHandler = (skyImage, horizonImage, userLoc) => {
        setSelectedSkyImage(skyImage)
        setSelectedHorizonImage(horizonImage)
        //setUserLoc(userLoc)
        isSlideCompleteHandler()
    }


    // storing slide selections in total selection state
    const onSlideChangeHandler = (slideSelection) => {
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

    // current user progress and assessment slides
    const {userProgress, availableSlides} = useSelector(state => state.assessment)
    useEffect(() => {
        setSlides(availableSlides)
    }, [props.navigation.isFocused()])

    // creating stepList for wizard with fetched slides
    const stepList =
        slides?.map((slide) => ({
            content:
                <QuestionSlide isLastStep={isLastStep} isComplete={isSlideCompleteHandler}
                               onSlideChange={onSlideChangeHandler}
                               questions={slide.questions}
                               slideName={slide.name}
                               description={slide.description}
                               savedSelection={selection?.find(sl => sl.slideName === slide.name)?.answers}/>
        }))


    // // Append PictureSlide to assessment
    const {group, repeatCount} = useSelector(state => state.auth)
    const pos = (userProgress === 0 || userProgress === repeatCount - 1) ? 2 : 1
    group === 'B' ? stepList.unshift(pictureSlide) : stepList.splice(stepList.length - pos, 0, pictureSlide)


    const dispatch = useDispatch()
    const submitHandler = async () => {
        // creating timeobj to get duration of user interaction
        // calc duration on server

        setIsFetching(true)

        setTime(() => time.end = (new Date() + 2))

        setVisible(!visible);
        await dispatch(saveAssessment(selectedSkyImage.base64, selectedHorizonImage.base64, time, selection))
        setIsFetching(false)
    }

    const closeModal = () => {
        setVisible(!visible)
        props.navigation.replace('Home')
    }


    return (
        <Screen>
            <ScrollView style={{flex: 1, width: '100%', backgroundColor: colors.background}}>
                {/* Wizard component that takes question and picture slide - stepList */}
                <Wizard useNativeDriver={true} prevStepAnimation='fade' nextStepAnimation='fade'
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
                           onPress={() => wizard.current.prev()}>
                    Zurück
                </CtmButton>
                <Stepper currentStep={currentStep} stepList={stepList}/>
                {isLastStep
                    ? (<CtmButton iconRight={true}
                                  icon='check' disabled={!slideComplete} mode='text'
                                  onPress={submitHandler}>Senden</CtmButton>)
                    : (<CtmButton iconRight={true} disabled={!slideComplete}
                                  icon='arrow-right' mode='text'
                                  onPress={() => {
                                      setSlideComplete(false)
                                      setIsFirstStep(true)
                                      wizard.current.next()
                                  }}>Weiter</CtmButton>)
                }
            </View>
            {/* Will be rendered if data submit is successful */}
            <SuccessAnimation success={!isFetching}  visible={visible} close={closeModal}/>
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

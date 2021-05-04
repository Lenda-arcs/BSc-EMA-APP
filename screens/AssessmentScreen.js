import React, {useEffect, useRef, useState} from 'react'
import {View, StyleSheet, ScrollView, Platform} from "react-native";
import {List, withTheme} from "react-native-paper";
import {useDispatch, useSelector} from "react-redux";
import {StackActions} from '@react-navigation/native'
import Wizard from 'react-native-wizard'


// Components
import Screen from "../components/wrapper/Screen";
import QuestionSlide from "../components/slides/QuestionSlide";
import PictureSlide from "../components/slides/PictureSlide";
import Stepper from "../components/helper/Stepper";
import CtmButton from "../components/wrapper/CtmButton";
import SuccessAnimation from "../components/helper/SuccessAnimation";

// Functions
import {saveAssessment, removeScheduledTime} from '../store/actions/assessment'
import CtmDialog from "../components/helper/CtmDialog";
import CtmSubheading from "../components/wrapper/CtmSubheading";
import QuestionItem from "../components/slides/QuestionItem";

const validPassTime = 1000 * 60 * 20 // 20min

const AssessmentScreen = props => {
    // destructure color prop form withTheme wrapper
    const {colors} = props.theme
    const {scheduledTime, startTime} = props.route.params

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

    // state for user selection
    const [selection, setSelection] = useState([])
    const [dialogVisible, setDialogVisible] = useState(false)


    const goToHome = () => {
        props.navigation.dispatch(StackActions.replace('Home'))
    }


    const showDialog = () => setDialogVisible(true)
    const hideDialog = () => {
        setDialogVisible(false)
        goToHome()
    }

    //seems to work =)
    useEffect(() => {
        const durationTimer = setInterval(() => {
            let currentTime = (new Date()).getTime()
            let diffTime = currentTime - startTime
            if (diffTime >= validPassTime) showDialog()
        }, 5000)
        return () => clearInterval(durationTimer)
    }, [])


    // QuestionSlide complete setter
    const isSlideCompleteHandler = () => {
        setSlideComplete(true)
    }
    // PicSlide complete setter
    const isPicSlideCompleteHandler = (skyImage, horizonImage) => {
        setSelectedSkyImage(skyImage)
        setSelectedHorizonImage(horizonImage)
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
    const {user, repeatCount} = useSelector(state => state.auth)
    const pos = (userProgress === 0 || userProgress === repeatCount - 1) ? 2 : 1
    user.group === 'B' ? stepList.unshift(pictureSlide) : stepList.splice(stepList.length - pos, 0, pictureSlide)


    const dispatch = useDispatch()
    const submitHandler = async () => {
        // creating timeobj to get duration of user interaction
        // calc duration on server
        const endTime = (new Date()).getTime()
        const timestamp = {start: startTime, end: endTime }
        setIsFetching(true)
        setVisible(!visible);
        await dispatch(
            saveAssessment(selectedSkyImage.base64, selectedHorizonImage.base64, timestamp, selection))
        setIsFetching(false)
    }

    const closeModal = () => {
        setVisible(!visible)
        dispatch(removeScheduledTime(scheduledTime))
        goToHome()
    }


    return (
        <Screen>

            <Wizard contentContainerStyle={{height: '92%', justifyContent: 'flex-start'}}
                    useNativeDriver={true} prevStepAnimation='fade' nextStepAnimation='fade'
                    isFirstStep={val => setIsFirstStep(val)}
                    isLastStep={val => setIsLastStep(val)} ref={wizard} steps={stepList}
                    currentStep={({currentStep, isLastStep, isFirstStep}) => {
                        setCurrentStep(currentStep)
                    }}/>
            <View style={{backgroundColor: colors.background, opacity: .9, ...styles.btnGroup}}>
                {/* USE FOR PRODUCTION */}
                <CtmButton style={{position: 'absolute', left: 8}} disabled={isFirstStep}
                           icon='arrow-left' mode='text'
                           onPress={() => wizard.current.prev()}>
                    Zurück
                </CtmButton>
                <Stepper currentStep={currentStep} stepList={stepList}/>
                {isLastStep
                    ? (<CtmButton style={{position: 'absolute', right: 8}} iconRight={true}
                                  icon='check' disabled={!slideComplete} mode='text'
                                  onPress={submitHandler}>Senden</CtmButton>)
                    : (<CtmButton style={{position: 'absolute', right: 8}} iconRight={true} disabled={!slideComplete}
                                  icon='arrow-right' mode='text'
                                  onPress={() => {
                                      setSlideComplete(false)
                                      setIsFirstStep(true)
                                      wizard.current.next()
                                  }}>Weiter</CtmButton>)
                }
            </View>
            {/* Will be rendered if data submit is successful */}
            <SuccessAnimation success={!isFetching} visible={visible} close={closeModal}/>
            <CtmDialog visible={dialogVisible} showDialog={showDialog} hideDialog={hideDialog}
                       helpText='Du hast die maximal Dauer für die Befragung überschritten, bitte warte auf die nächste Benachrichtigung.'
                       title='Fehlgeschlagen'/>
        </Screen>


    )
};

const styles = StyleSheet.create({

    btnGroup: {
        alignSelf: 'center',
        paddingVertical: 25,
        marginTop: 20,
        width: '100%',
        height: '8%',
        minHeight: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: Platform.OS === 'ios' && Platform.Version >= 11 ? 15 : 6,


    },
})


export default withTheme(AssessmentScreen)

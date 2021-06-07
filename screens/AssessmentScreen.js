import React, {useEffect, useRef, useState} from 'react'
import {View, StyleSheet, Platform} from "react-native";
import {withTheme} from "react-native-paper";
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


import {saveAssessment, removeScheduledTime} from '../store/actions/assessment'
import CtmDialog from "../components/helper/CtmDialog";

const validPassTime = 1000 * 60 * 20 // 20min

const AssessmentScreen = props => {
    const dispatch = useDispatch()
    const {colors} = props.theme
    const {scheduledTime, startTime} = props.route.params

    const {userProgress, availableSlides} = useSelector(state => state.assessment)
    const {user, repeatCount} = useSelector(state => state.auth)

    const [isFetching, setIsFetching] = useState(false)

    const [visible, setVisible] = useState(false);
    const [dialogState, setDialogState] = useState({visible: false, text: '', title: ''})

    const wizard = useRef(null)
    const [wizardState, setWizardState] = useState({isLastStep: false, isFirstStep: true, currentStep: 0})
    const [slides, setSlides] = useState([])

    const [slideComplete, setSlideComplete] = useState(false)

    const [selectedSkyImage, setSelectedSkyImage] = useState()
    const [selectedHorizonImage, setSelectedHorizonImage] = useState()

    const [selection, setSelection] = useState([])

    const goToHome = () => {
        dispatch(removeScheduledTime(scheduledTime))
        props.navigation.dispatch(StackActions.replace('Home'))
    }

    const showDialog = (err) => {
        setDialogState({visible: true, text: err, title: 'Fehlgeschlagen'})
    }
    const hideDialog = () => {
        setDialogState({...dialogState, visible: false})
        goToHome()
    }

    useEffect(() => {
        const durationTimer =
            setInterval(() => {
                let currentTime = (new Date()).getTime()
                let diffTime = currentTime - startTime
                if (diffTime >= validPassTime) showDialog('Sie haben die maximale Bearbeitungszeit für diese Befragung überschritten, warten Sie auf die nächste Benachrichtigung.')
            }, 5000)
        return () => clearInterval(durationTimer)
    }, [])

    const isSlideCompleteHandler = () => {
        setSlideComplete(true)
    }

    const isPicSlideCompleteHandler = (skyImage, horizonImage) => {
        setSelectedSkyImage(skyImage)
        setSelectedHorizonImage(horizonImage)
        isSlideCompleteHandler()
    }

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
        content:
            <PictureSlide
                isComplete={isPicSlideCompleteHandler}
                savedData={{
                    sky: selectedSkyImage,
                    horizon: selectedHorizonImage
                }}
            />
    }

    useEffect(() => {
        setSlides(availableSlides)
    }, [props.navigation.isFocused()])

    const stepList =
        slides?.map((slide) => ({
            content:
                <QuestionSlide isLastStep={wizardState.isLastStep}
                               isComplete={isSlideCompleteHandler}
                               onSlideChange={onSlideChangeHandler}
                               questions={slide.questions}
                               slideName={slide.name}
                               description={slide.description}
                               savedSelection={selection?.find(sl => sl.slideName === slide.name)?.answers}/>
        }))

    const pos = (userProgress === 0 || userProgress === repeatCount - 1) ? 2 : 1
    user.group === 'B' ? stepList.unshift(pictureSlide) : stepList.splice(stepList.length - pos, 0, pictureSlide)

    const submitHandler = async () => {
        const endTime = (new Date()).getTime()
        const timestamp = {start: startTime, end: endTime}
        setIsFetching(true)
        setVisible(!visible);
        try {
            await dispatch(saveAssessment(
                selectedSkyImage,
                selectedHorizonImage,
                timestamp,
                selection
            ))
            setIsFetching(false)
        } catch (err) {
            setVisible(!visible)
            showDialog(err.message)
        }
    }

    const closeModal = () => {
        setWizardState({...wizardState, currentStep: 0}) // avoids undefined activeStep error on wizard
        goToHome()
    }


    return (
        <Screen>

            <Wizard
                activeStep={wizardState.currentStep}
                contentContainerStyle={styles.wizardCtn}
                useNativeDriver={true}
                prevStepAnimation='fade'
                nextStepAnimation='fade'
                isFirstStep={val => setWizardState({...wizardState, isFirstStep: val})}
                isLastStep={val => setWizardState({...wizardState, isLastStep: val})}
                ref={wizard}
                steps={stepList}
                currentStep={({currentStep, isLastStep, isFirstStep}) => {
                    setWizardState({currentStep, isLastStep, isFirstStep})
                }}
            />
            <View
                style={{backgroundColor: colors.background, ...styles.btnGroup}}>
                <CtmButton style={styles.btnLeft}
                           disabled={wizardState.isFirstStep}
                           icon='arrow-left'
                           mode='text'
                           onPress={() => wizard.current.prev()}>
                    Zurück
                </CtmButton>
                <Stepper
                    currentStep={wizardState.currentStep}
                    stepList={stepList}/>
                {wizardState.isLastStep
                    ? (<CtmButton
                        style={styles.btnRight}
                        iconRight={true}
                        icon='check'
                        disabled={!slideComplete}
                        mode='text'
                        onPress={submitHandler}
                    >Senden
                    </CtmButton>)
                    : (<CtmButton
                        style={styles.btnRight}
                        iconRight={true}
                        disabled={!slideComplete}
                        icon='arrow-right'
                        mode='text'
                        onPress={() => {
                            setSlideComplete(false)
                            setWizardState({...wizardState, isFirstStep: true})
                            // setIsFirstStep(true)
                            wizard.current.next()
                        }}>Weiter
                    </CtmButton>)
                }
            </View>
            {/* Will be rendered if data submit is successful */}
            <SuccessAnimation
                success={!isFetching}
                visible={visible}
                close={closeModal}/>
            <CtmDialog
                visible={dialogState.visible}
                showDialog={showDialog}
                hideDialog={hideDialog}
                helpText={dialogState.text}
                title={dialogState.title}/>
        </Screen>


    )
};

const styles = StyleSheet.create({
    wizardCtn: {
        height: '92%',
        justifyContent: 'flex-start'
    },
    btnGroup: {
        alignSelf: 'center',
        paddingVertical: 25,
        marginTop: 20,
        opacity: .9,
        width: '100%',
        height: '8%',
        minHeight: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: Platform.OS === 'ios' && Platform.Version >= 11 ? 15 : 6,
    },
    btnRight: {position: 'absolute', right: 8},
    btnLeft: {position: 'absolute', left: 8}
})


export default withTheme(AssessmentScreen)

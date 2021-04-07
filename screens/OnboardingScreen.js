import {Alert, StatusBar} from 'react-native';
import React from 'react';

import {withTheme} from "react-native-paper";

import {useDispatch} from "react-redux";
import * as authActions from '../store/actions/auth'

import {Icon} from 'react-native-elements';
import Onboarding from 'react-native-onboarding-swiper';
import CtmButton from "../components/wrapper/CtmButton";


const Next = ({...props}) => (
    <CtmButton mode='text' {...props}>Weiter</CtmButton>
)

const Skip = ({...props}) => (
    <CtmButton mode='text' {...props}>Skip</CtmButton>
)

const Done = ({...props}) => (
    <CtmButton {...props}>Anmelden</CtmButton>
)

const OnboardingScreen = (props) => {
    const dispatch = useDispatch()
    const {colors} = props.theme


    const succeedHandler = () => {
        dispatch(authActions.finishBoarding())
    }

    return (
        <Onboarding
            showDone={false}
            SkipButtonComponent={Skip}
            NextButtonComponent={Next}
            DoneButtonComponent={Done}
            onSkip={succeedHandler}
            onDone={succeedHandler}
            pages={[
                {
                    title: 'Hey!',
                    subtitle: 'Willkommen bei der Studie #Name',
                    backgroundColor: colors.background,
                    image: (
                        <Icon
                            name="hand-peace-o"
                            type="font-awesome"
                            size={100}
                            color={colors.primary}
                        />
                    ),
                },
                {
                    title: 'Danke!',
                    subtitle: 'Schön das du dabei bist.',
                    backgroundColor: colors.background,
                    image: (
                        <Icon
                            name="paper-plane-o"
                            type="font-awesome"
                            size={100}
                            color={colors.primary}
                        />
                    ),
                },
                {
                    title: 'Push Nachricht',
                    subtitle: 'Du erhälts eine Benachrichtigung sobald es wieder an der Zeit ist die Befragung durchzuführen',
                    backgroundColor: colors.primary,
                    image: (
                        <Icon name="bell-o" type="font-awesome" size={100} color={colors.primary}/>
                    ),
                },
                {
                    title: "Lass uns starten!",
                    subtitle: (
                        <CtmButton mode='text'
                                   title={'Get Started'}
                                   onPress={() => {
                                       succeedHandler()
                                       StatusBar.setBarStyle('default'); // ??
                                   }}
                        >Anmelden</CtmButton>
                    ),
                    backgroundColor: colors.accent,
                    image: (
                        <Icon name="rocket" type="font-awesome" size={100} color="white"/>
                    ),
                },
            ]}
        />

    )
};

export default withTheme(OnboardingScreen)

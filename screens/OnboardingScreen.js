import {StatusBar} from 'react-native';
import React, {useState} from 'react';

import {withTheme} from "react-native-paper";

import {Icon} from 'react-native-elements';
import Onboarding from 'react-native-onboarding-swiper';
import Screen from "../components/wrapper/Screen";
import CtmButton from "../components/wrapper/CtmButton";
import {useSelector} from "react-redux";


const Next = ({...props}) => (
    <CtmButton style={{marginRight: 8}} mode='text' {...props}>Weiter</CtmButton>
)

const Skip = ({...props}) => (
    <CtmButton style={{marginLeft: 8}} mode='text' {...props}>Skip</CtmButton>
)

const Done = ({...props}) => (
    <CtmButton style={{marginTop: 20}} mode={'contained'} {...props}>Anmelden</CtmButton>
)


const content = (colors, succeedHandler) => [
    {
        title: 'Hey!',
        subtitle: 'Willkommen bei der iViewSky Studie!',
        backgroundColor: colors.accent,
        image: (<Icon name="hand-peace-o" type="font-awesome" size={100} color={colors.primary}/>),
    },
    {
        title: 'Benachrichtigung',
        subtitle: 'Du erhälst eine Benachrichtigung, sobald die nächste Befragung für Dich ansteht',
        backgroundColor: colors.background,
        image: (<Icon name="bell-o" type="font-awesome" size={100} color={colors.primary}/>),
    },
    {
        title: 'Zugang',
        subtitle: 'Die Teilnahme an der Befragung ist ab dem Zeitpunkt der Benachrichtigung für 30 Minuten möglich. Solltest Du es mal nicht rechtzeitig schaffen, kannst Du auf die nächste Benachrichtigung warten.',
        backgroundColor: colors.background,
        image: (<Icon name="hourglass-start" type="font-awesome" size={100} color={colors.accent}/>),
    },
    {
        title: 'Befragung',
        subtitle: 'Bitte beantworte alle Fragen wahrheitsgemäß und lass Dir bei der Beantwortung Zeit ',
        backgroundColor: colors.background,
        image: (<Icon name="tasks" type="font-awesome" size={100} color={colors.accent}/>
        ),
    },
    {
        title: 'Fotos',
        subtitle: 'Während der Befragung sollst Du Fotos vom Himmel machen. Ein Foto in vertikaler und ein Foto in horizontaler Blickrichtung',
        backgroundColor: colors.background,
        image: (<Icon name="camera" type="font-awesome" size={100} color={colors.primary}/>),
    },
    {
        title: 'Fotos: Geschlossener Raum',
        subtitle: 'Befindest Du dich während der Befragung in einem geschlossenen Raum, machst Du bitte die Fotos wenn möglich aus einem geöffneten Fenster in Deiner Nähe',
        backgroundColor: colors.background,
        image: (<Icon name="camera" type="font-awesome" size={100} color={colors.primary}/>),
    },
    {
        title: 'Fotos: Freier Himmel',
        subtitle: 'Befindest Du dich während der Befragung draußen unter freiem Himmel, machst Du bitte ein Foto von dem Himmel direkt über Dir und ein Foto vom Horizont in Blickrichtung. ',
        backgroundColor: colors.background,
        image: (<Icon name="camera" type="font-awesome" size={100} color={colors.primary}/>),
    },

    {
        title: "Lass uns starten!",
        subtitle: (<Done onPress={succeedHandler}/>
        ), backgroundColor: colors.accent,
        image: (<Icon name="rocket" type="font-awesome" size={100} color="white"/>),
    }
]

const OnboardingScreen = (props) => {
    const {colors} = props.theme


    const succeedHandler = () => {
        props.navigation.navigate('Auth')
    }

    return (
            <Onboarding
                showDone={false}
                SkipButtonComponent={Skip}
                NextButtonComponent={Next}
                DoneButtonComponent={Done}
                subTitleStyles={{fontSize: 18, marginHorizontal: 20}}
                onSkip={succeedHandler}
                onDone={succeedHandler}
                pages={content(colors, succeedHandler)}
            />

    )
}

export default withTheme(OnboardingScreen)

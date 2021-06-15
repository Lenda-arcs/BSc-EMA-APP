import {StatusBar, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';

import {Button, Paragraph, Subheading, withTheme} from "react-native-paper";

import {Icon} from 'react-native-elements';
import Onboarding from 'react-native-onboarding-swiper';
import CtmDialog from "../components/helper/CtmDialog";
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

//todo: get  text from server?
const text = `Wir erheben Ihre Daten ausschließlich zur Verwendung für wissenschaftliche Zwecke. Die Datensätze werden vollkommen anonym ausgewertet. Es werden unter keinen Umständen Rückschlüsse auf Ihre Person möglich sein. Es wird gewährleistet, dass Ihre Daten nicht an Dritte weitergegeben werden. Bei einer Veröffentlichung der Studien Ergebnisse wird aus den Daten nicht hervorgehen, wer an dieser Untersuchung teilgenommen hat. 

Mit Setzen eines Hakens in dem untenstehenden Kästchen bestätigen Sie, dass Sie mit vorstehend geschilderten Vorgehensweise einverstanden sind und zustimmen, an dieser Untersuchung teilzunehmen. 

Wenn Sie mehr Informationen über die Verarbeitung Ihrer personenbezogenen Daten erhalten möchten, klicken Sie bitte auf `

const dataProtectDetails = [
    {
        heading: 'Verarbeitungsdauer der personenbezogenen Daten',
        text: 'Die Verarbeitungsdauer der personenbezogenen Daten ist unbeschränkt.'
    },
    {
        heading: 'Empfänger der personenbezogenen Daten',
        text: 'Die Empfänger der personenbezogenen Daten sind wissenschaftliche Mitarbeitende und Studierende der Universität Hamburg und des Uniklinikums Eppendorf.'
    },
    {
        heading: 'Gesetzliche oder vertragliche Auflage',
        text: 'Die Verarbeitung basiert auf der Zustimmung des Datensubjekts.'
    },
    {
        heading: 'Informationen zu den Rechten der Datensubjekte',
        text: 'Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und mögliche Empfänger und den Zweck der Datenverarbeitung (Art. 15 DSGVO) und ggf. ein Recht auf Berichtigung unrichtiger Daten (Art. 17 DSGVO) das Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO), auf Widerspruch (Art. 21 DSGVO) sowie das Recht auf Datenübertragbarkeit von Ihnen bereitgestellter Daten (Art. 20 DSGVO). Beim Auskunftsrecht und beim Löschrecht gelten die Einschränkungen nach §§ 8 ff LDSG BW.'
    },
    {
        heading: 'Informationen über das Recht, die Zustimmung zu widerufen',
        text: 'Die Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie können eine bereits erteilte Einwilligung jederzeit widerrufen. Dazu reicht eine formlose Mitteilung per E-Mail an uns. Die Rechtsmäßigkeit der bis zum Widerruf erfolgten Datenverabeitung bleibt vom Widerruf unberührt.'
    },
    {
        heading: 'Datenschutzbehörde',
        text: 'Ihnen stehen im Falle datenschutzrechtlicher Verstöße ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu (Art. 77 DSGVO i.V.m § 25 LSG). Zuständige Aufsichtsbehörde in datenschutzrechtlichen Fragen ist der Landesdatenschutzbeauftragte des Bundeslands, in dem unser Institut seinen Sitz hat.'
    }
]

const intro = <Text><Paragraph style={{lineHeight: 22}}>{text}</Paragraph><Paragraph style={{fontWeight: 'bold'}}>DETAILS.</Paragraph></Text>
const allDetails =
    <>
        {dataProtectDetails?.map((detail, index) =>
            <Text style={{marginBottom: 5}} key={index}>
                <Subheading style={{fontWeight: 'bold'}}>{detail.heading}</Subheading> {'\n'}
                <Paragraph style={{lineHeight: 22}}>{detail.text}</Paragraph>
            </Text>)
        }
    </>


const content = (colors, succeedHandler) => [
    {
        title: 'Hey!',
        subtitle: 'Willkommen bei iViewSky!',
        backgroundColor: colors.accent,
        image: (<Icon name="hand-peace-o" type="font-awesome" size={100} color={colors.primary}/>),
    },
    {
        title: 'Benachrichtigung',
        subtitle: 'Sie erhalten eine Benachrichtigung, sobald Sie an einer Befragung teilnehmen können. Achten Sie darauf, dass ihr Smartphone auf "laut" eingestellt ist, bzw. erstellen Sie eine Ausnahme für die ExpoGo App während der gesamten Dauer der Studie.',
        backgroundColor: colors.background,
        image: (<Icon name="bell-o" type="font-awesome" size={100} color={colors.primary}/>),
    },
    {
        title: 'Zugang zu einer Befragung',
        subtitle: 'Die Teilnahme an der Befragung ist ab dem Zeitpunkt der Benachrichtigung für 30 Minuten freigeschaltet. Sollten Sie es mal nicht rechtzeitig schaffen, können Sie auf die nächste Benachrichtigung warten.',
        backgroundColor: colors.background,
        image: (<Icon name="hourglass-start" type="font-awesome" size={100} color={colors.accent}/>),
    },
    {
        title: 'Befragung',
        subtitle: 'Bitte beantworten Sie alle Fragen wahrheitsgemäß und lassen Sie sich bei der Beantwortung Zeit. Die maximale Bearbeitungszeit für eine Befragung ist 20 Minuten.',
        backgroundColor: colors.background,
        image: (<Icon name="tasks" type="font-awesome" size={100} color={colors.accent}/>
        ),
    },
    {
        title: 'Fotos',
        subtitle: 'Während jeder Befragung werden Sie aufgefordert Fotos vom Himmel zu machen. Ein Foto in vertikaler sowie ein Foto in horizontaler Blickrichtung. Alle Fotos müssen im Hochformat gemacht werden!',
        backgroundColor: colors.background,
        image: (<Icon name="camera" type="font-awesome" size={100} color={colors.primary}/>),
    },
    {
        title: 'Fotos: Geschlossener Raum',
        subtitle: 'Befinden Sie sich während einer Befragung in einem geschlossenen Raum, machen Sie bitte die Fotos aus einem geöffneten Fenster in Ihrer Nähe heraus. Es sollten keine Teile des Fensters auf dem Foto zu sehen sein.',
        backgroundColor: colors.background,
        image: (<Icon name="camera" type="font-awesome" size={100} color={colors.primary}/>),
    },
    {
        title: 'Fotos: Freier Himmel',
        subtitle: 'Befinden Sie sich während einer Befragung draußen unter freiem Himmel, machen Sie bitte ein Foto vom Himmel direkt über Ihnen sowie ein Foto vom Horizont in Ihrer Blickrichtung. ',
        backgroundColor: colors.background,
        image: (<Icon name="camera" type="font-awesome" size={100} color={colors.primary}/>),
    },

    {
        title: "Lass uns starten!",
        subtitle: (<Done onPress={succeedHandler}/>),
        backgroundColor: colors.accent,
        image: (<Icon name="rocket" type="font-awesome" size={100} color="white"/>),
    }
]

const OnboardingScreen = (props) => {
    const {colors} = props.theme
    const [visible, setVisible] = useState(false)
    const [accepted, setAccepted] = useState(false)

    const succeedHandler = () => {
        setVisible(true)

    }
    const checkedHandler = () => {
        setAccepted(true)
        setVisible(false)
    }


    useEffect(() => {
        accepted &&  props.navigation.navigate('Auth')
    }, [accepted])

    return (
        <>
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
            <CtmDialog
                checkBox
                title='Informationen zur Datenverarbeitung'
                hideDialog={checkedHandler}
                visible={visible}
                content={[intro, allDetails]}/>
        </>


    )
}

export default withTheme(OnboardingScreen)

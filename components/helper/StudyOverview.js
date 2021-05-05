import React, {useCallback, useEffect, useRef, useState} from "react";
import {Animated, Dimensions, View} from "react-native";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import {Headline, Paragraph} from "react-native-paper";

const windowWidth = (Dimensions.get('window')).width
const windowHeight = (Dimensions.get('window')).height


const circleSize = windowWidth >= 400 ? windowWidth / 1.6 : 230
const calcPaddingTop = windowHeight > 800 ? 50 : 0

const StudyOverview = ({count, colors, repeats, style, userName}) => {
    const [fill, setFill] = useState(0)
    const [text, setText] = useState('Willkommen bei der Studie!')

    useEffect(() => {
        setFill(count / repeats * 100)
        if (count > 0 && count < repeats - (repeats / 6)) setText('Dein Fortschritt')
        else if (count >= repeats) setText('Du hast es geschafft!')
        else if (count >= (repeats - (repeats / 6))) setText('Du hast es fast geschafft!')


    }, [count])

    return (
        <View style={{alignItems:'center', paddingTop: calcPaddingTop, ...style}}>
           <View style={{justifyContent: 'center', marginBottom: 30, alignItems: 'center'}}>
               <Headline style={{fontSize: 20}}>{text}</Headline>
               <Paragraph>Teilnehmer: {userName}</Paragraph>
           </View>
            <AnimatedCircularProgress

                size={circleSize}
                width={15}
                arcSweepAngle={360}
                rotation={0}
                lineCap="round"
                fill={fill}
                tintColor={colors.accent}
                backgroundColor={'#fff'}>
                {
                    useCallback((fill) => (

                        <Headline style={{fontSize: 24}}>
                            {count} von {repeats}
                        </Headline>
                    ), [count])
                }
            </AnimatedCircularProgress>
        </View>
    )
}

export default StudyOverview

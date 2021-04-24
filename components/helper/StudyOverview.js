import React, {useCallback, useEffect, useRef, useState} from "react";
import {Animated, View} from "react-native";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import {Headline, Text} from "react-native-paper";


const StudyOverview = ({count, colors, repeats, style}) => {
    const [fill, setFill] = useState(0)
    const [text, setText] = useState('Willkommen bei der Studie!')

    useEffect(() => {
        setFill(count / repeats * 100)
        if (count > 0 && count < repeats - 5) setText('Dein Fortschritt')
        else if (count >= repeats) setText('Du hast es geschafft!')
        else if (count >= repeats - 5) setText('Du hast es fast geschafft!')


    }, [count])

    return (
        <View style={{backgroundColor: colors.background, ...style}}>
            <Headline style={{fontSize: 18,textAlign: 'center', marginBottom: 30}}>{text}</Headline>
            <AnimatedCircularProgress
                size={260}
                width={15}
                arcSweepAngle={360}
                rotation={0}
                lineCap="square"
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

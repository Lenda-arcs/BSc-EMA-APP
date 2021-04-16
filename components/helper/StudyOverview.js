import React, {useCallback, useEffect, useRef, useState} from "react";
import {Animated, View} from "react-native";
import {AnimatedCircularProgress} from "react-native-circular-progress";
import {Headline, Text} from "react-native-paper";


const StudyOverview = ({count, colors}) => {
    const [fill, setFill] = useState(0)
    const [text, setText] = useState('Willkommen bei der Studie!')

    useEffect(() => {
        setFill(count / 30 * 100)
        if (count > 0 && count < 25) setText('Dein Fortschritt')
        else if (count >= 25) setText('Du hast es fast geschafft!')
        else setText('Du hast es geschaft!')
    }, [count])

    return (
        <View style={{backgroundColor: colors.background, marginBottom: 130}}>
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

                        <Headline>
                            {count}

                        </Headline>
                    ), [count])
                }
            </AnimatedCircularProgress>
            {/*<View style={{flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 40, marginTop: -20}}>*/}
            {/*    <Text>0</Text>*/}
            {/*    <Text>30</Text>*/}
            {/*</View>*/}
        </View>
    )
}

export default StudyOverview

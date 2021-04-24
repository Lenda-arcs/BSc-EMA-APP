import React, {useEffect, useState} from 'react'
import {View} from "react-native";
import {Paragraph} from "react-native-paper";



const CountdownTimer = ({stopTimer}) => {
    const [sec, setSec] = useState(0)
    const [min, setMin] = useState(0)


    useEffect(() => {
        const timeInterval = setInterval(() => {

            setSec(prevState => prevState + 1)
        }, 100)
        return () => clearInterval(timeInterval)
    }, [setSec])


    return (
        <View>
            <Paragraph>Time passed: { sec }</Paragraph>
        </View>
    )
}


export default CountdownTimer

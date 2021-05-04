import React from 'react'
import {View} from "react-native";
import {withTheme} from "react-native-paper";



const Stepper = props => {
    const {colors} = props.theme

    return (
        <View style={{flexDirection: "row", alignSelf: 'center', marginHorizontal: 20, alignItems: 'center'}}>
            {props.stepList.map((val, index) => (
                <View
                    key={"step-indicator-" + index}
                    style={{
                        width: index === props.currentStep ? 8 : 8,
                        marginHorizontal: 5,
                        height: index === props.currentStep ? 8 : 8,
                        borderRadius: 10,
                        backgroundColor: index === props.currentStep ? colors.primary : '#ccc',

                    }}
                />
            ))}
        </View>
    )
}


export default withTheme(Stepper)

import React from 'react'
import {StyleSheet} from "react-native";
import {Button} from "react-native-paper";


const CtmButton = props => {
    return (
        <Button style={{...props.style}}
                contentStyle={props.iconRight ? {...styles.iconRight, ...styles.btn} : styles.btn}
                labelStyle={styles.label} {...props} >
            {props.children}
        </Button>
    )
}


const styles = StyleSheet.create({
    btn: {
        marginVertical: 5
    },
    iconRight: {
        flexDirection: 'row-reverse'
    }
})

export default CtmButton


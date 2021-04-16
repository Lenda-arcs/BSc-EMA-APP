import React from 'react'
import {StyleSheet} from 'react-native'
import {Subheading} from "react-native-paper";


const CtmSubheading = props => {return <Subheading style={{...props.style ,...styles.heading}}>{props.children}</Subheading>}


const styles = StyleSheet.create({
    heading: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 10,
        paddingTop: 10
    }
})

export default CtmSubheading

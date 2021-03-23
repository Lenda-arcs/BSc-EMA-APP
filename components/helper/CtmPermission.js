import React, {useEffect} from 'react'

import * as Permissions from "expo-permissions";
import {ActivityIndicator, Button, Text} from "react-native-paper";
import {View} from "react-native";


//

const CtmPermission = () => {

    useEffect(() => {
        const checkMultiplePermissions = async () => {
            const {status, permissions} = await Permissions.getAsync(
                Permissions.NOTIFICATIONS,
                Permissions.LOCATION,
                Permissions.CAMERA,
                Permissions.MEDIA_LIBRARY
            )

            if (status !== 'granted') {
                const response = await Permissions.askAsync(
                    Permissions.NOTIFICATIONS,
                    Permissions.LOCATION,
                    Permissions.CAMERA,
                    Permissions.MEDIA_LIBRARY
                )
                //console.log(response)
            }

        }

        checkMultiplePermissions()
    }, [])


    return <></>

}


export default CtmPermission

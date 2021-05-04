import React, {useEffect} from 'react'

import * as Notifications from 'expo-notifications'
import * as Location from 'expo-location'
import * as ImagePicker from "expo-image-picker";

const checkNotificationPermission = async () => {
    const settings = await Notifications.getPermissionsAsync()
    if (!settings.granted || settings.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
        const request = await Notifications.requestPermissionsAsync({
            android: {},
            ios: {
                allowAnnouncements: true,
                allowAlert: true,
                allowSound: true
            }
        })
    }
}
const checkLocationPermission = async () => {
    const settings = await Location.getForegroundPermissionsAsync()
    if (!settings.granted) {
        const request = await Location.requestForegroundPermissionsAsync()
    }
}

const checkCameraPermission = async () => {
    const settingsCam = await ImagePicker.getCameraPermissionsAsync()
    const settingsMedia = await ImagePicker.getMediaLibraryPermissionsAsync()
    if (!settingsCam.granted || !settingsMedia.granted) {
        const requestCam = ImagePicker.requestCameraPermissionsAsync()
        const requestMedia = ImagePicker.requestMediaLibraryPermissionsAsync()
    }
}


const CtmPermission = () => {


    useEffect(() => {
       // checkNotificationPermission()
        checkLocationPermission()
      //  checkCameraPermission()
    })


return <></>

}


export default CtmPermission

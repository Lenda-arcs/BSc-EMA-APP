import * as Notifications from 'expo-notifications'
import {Platform} from "react-native";


exports.scheduleNotificationHandler = async (nextDate) => {

    Platform.OS === 'ios' && await Notifications.requestPermissionsAsync(
        {ios: {
            allowAlert: true,
                allowSound: true,
                allowAnnouncements: true
            } })

    // Local Notification
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Erinnerung: EMA STUDIE',
            body: 'Hey, es ist wieder Zeit für die Befragung =)',
            color: '#c01d1d',

        }, trigger: {
            date: nextDate,
            repeats: false
        }
    });
    //console.log('wait for it..' + nextDate)
}


exports.calcResTime = (resTime) => {
    let currentTime = (new Date()).getTime() / 1000 // resTime already in seconds
    return Math.round(currentTime - resTime)

}

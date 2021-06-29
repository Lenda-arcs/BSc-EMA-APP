import {Platform} from "react-native";
import * as Notifications from 'expo-notifications'
import {getItemAsyncStore} from "./asyncStoreFactories";
const NOTIFICATION_TIMES = 'NOTIFICATION_TIMES'


exports.checkNotificationPermission = async () => {
    const settings = await Notifications.getPermissionsAsync()
    if (!settings.granted || settings.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
        const request = await Notifications.requestPermissionsAsync({
            android: {},
            ios: {
                allowAnnouncements: true,
                allowAlert: true,
                allowSound: true,
                allowsCriticalAlerts: true,
                allowBadge: true,
            }
        })
        return request
    }


}


exports.scheduleNotificationHandler = async (nextTrigger) => {
    let trigger = {date: nextTrigger}
    if (Platform.OS === 'ios') {trigger = nextTrigger}

    // Local Notification
    return  await Notifications.scheduleNotificationAsync({
        content: {
            sound: true,
            priority: 'max',
            title: 'Erinnerung: iViewSky',
            body: 'Sie können an der Befragung teilnehmen. Die Teilnahme ab jetzt für 30 Minuten möglich.',
            vibrate: true,
            color: '#c40017',

        }, trigger

    });
}

const difInSec = (currentTime, timeInPast) => {
    return (
        Math.round((currentTime - timeInPast) / 1000)
    )
}


exports.filterTimeArr = async (notification) => {
    const currentTime = new Date().getTime()
    const timesArr = await getItemAsyncStore(NOTIFICATION_TIMES, false, true)
    if (notification !== null) {
        const trigger = notification?.res?.notification?.request?.trigger?.value
        return {timeLeft: 60 * 30 - difInSec(currentTime, trigger), scheduledTime: trigger}
    }
    else if (timesArr) {
        const time = timesArr.filter(noteTime => {
            let diffInSec = difInSec(currentTime, noteTime)
            return (diffInSec <= 60 * 30 && diffInSec >= 0)
        })
        if (time.length > 0)  return {timeLeft: 60 * 30 - difInSec(currentTime, time[0]), scheduledTime: time[0]} // return 30 minutes - difference

    }
    return false
}

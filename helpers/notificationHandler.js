import * as Notifications from 'expo-notifications'


exports.scheduleNotificationHandler = async (nextDate) => {

    // Local Notification
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Erinnerung: EMA STUDIE',
            body: 'Hey, es ist wieder Zeit für eine Befragung =)',
            color: '#c01d1d',

        }, trigger: {
            date: nextDate,
            repeats: false
        }
    });
    //console.log('wait for it..' + nextDate)
}


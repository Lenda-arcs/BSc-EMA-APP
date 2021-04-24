import * as Permissions from "expo-permissions";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";


const checkPermissions = async (Type) => {
    let permStatusRes = await Permissions.getAsync(Type)
    if (permStatusRes.status !== 'granted') permStatusRes = await Permissions.askAsync(Type)
    if (permStatusRes.status !== 'granted') return false
    else return true
}

// export const getUserPushToken = async () => {
//     const hasPermissions = checkPermissions(Permissions.NOTIFICATIONS)
//     if (!hasPermissions) throw new Error('Um fortzufahren benötigen wir dein Einverständnis, dass wir dir Benachrichtigungen senden dürfen')
//     else return (await Notifications.getExpoPushTokenAsync()).data
// }

export const getUserLocation = async () => {
    const hasPermissions = checkPermissions(Permissions.LOCATION)
    if (!hasPermissions) throw new Error('Damit wir weitermachen können, benötigen wir deine Zustimmung für die Standortabfrage')
    else  return await Location.getCurrentPositionAsync({accuracy: 5})
}

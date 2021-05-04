import * as Location from "expo-location";


const checkPermissions = async () => {
    let permStatusRes = await Location.getForegroundPermissionsAsync()
    if (!permStatusRes.granted) permStatusRes = await Location.requestForegroundPermissionsAsync()
    else return true
}


export const getUserLocation = async () => {
    const hasPermissions = checkPermissions()
    if (!hasPermissions) throw new Error('Damit wir weitermachen können, benötigen wir deine Zustimmung für die Standortabfrage')
    else return await Location.getCurrentPositionAsync({accuracy: 5})
}

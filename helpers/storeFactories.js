import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";



export const fetchData = async (url, method, data = null, authToken = null) => {
    let response, headers, body

    if (authToken) headers = {'Content-Type': 'application/json', "Authorization": `Bearer ${authToken}`}
    else headers = {'Content-Type': 'application/json'}

    if (!data) body = null
    else body = JSON.stringify(data)

    response = await fetch(url, {
        method: method,
        headers: headers,
        body: body
    })
    if (!response.ok) {
        const errRes = await response.json()
        const errText = errRes.message
        throw new Error(errText)
    }
    return await response.json()

}

export const saveItemAsyncStore = async (key, value, safe = false) => {
    let val

    // transform item for storage
    if (typeof value === 'object' && value !== null) val = JSON.stringify(value)
    if (typeof value === 'number' || typeof value === 'boolean') val = value.toString()

    try {
        if (safe) await SecureStore.setItemAsync(key, val)
        else await AsyncStorage.setItem(key, val)
    } catch (err) {
        throw new Error(err.message)
    }
}

export const getItemAsyncStore = async (key, safe = false) => {
    let result
    try {
        if (safe) result = await SecureStore.getItemAsync(key)
        else result = await AsyncStorage.getItem(key)
    } catch (err) {
        throw new Error(err.message)
    }
    return result
}


export const deleteItemAsyncStore = async (key, safe = false) => {
    try {
        if (safe) await SecureStore.deleteItemAsync(key)
        else await AsyncStorage.setItem(key)
    } catch (err) {
        throw new Error(err.message)
    }
}

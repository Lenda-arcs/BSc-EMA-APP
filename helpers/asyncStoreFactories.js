import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";



export const saveItemAsyncStore = async (key, value, safe = false) => {
    let val

    // transform item for storage
    if (typeof value === 'object' && value !== null) val = JSON.stringify(value)
    if (typeof value === 'array' && value !== null) val = JSON.stringify(value)
    if (typeof value === 'number' || typeof value === 'boolean') val = value.toString()

    try {
        if (safe) await SecureStore.setItemAsync(key, val)
        else await AsyncStorage.setItem(key, val)
    } catch (err) {
        throw new Error(err.message)
    }
}

export const getItemAsyncStore = async (key, safe = false, parse = undefined) => {
    let result
    try {
        if (safe) result = await SecureStore.getItemAsync(key)
        else result = await AsyncStorage.getItem(key)
    } catch (err) {
        throw new Error(err.message)
    }
    if (parse) return JSON.parse(result)
    return result
}


export const deleteItemAsyncStore = async (key, safe = false) => {
    try {
        if (safe) await SecureStore.deleteItemAsync(key)
        else await AsyncStorage.removeItem(key)
    } catch (err) {
        throw new Error(err.message)
    }
}

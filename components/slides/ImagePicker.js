import React, {useState} from 'react'
import {View, StyleSheet, Image, Platform, TouchableNativeFeedback, TouchableOpacity} from 'react-native'
import {IconButton, Card, TouchableRipple, withTheme} from "react-native-paper";
import * as ImagePicker from 'expo-image-picker'


let TouchableCmp = TouchableOpacity

if (Platform.OS === 'android' && Platform.Version >= 21) {
    TouchableCmp = TouchableNativeFeedback
}

const checkCameraPermission = async () => {
    const settingsCam = await ImagePicker.getCameraPermissionsAsync()
    const settingsMedia = await ImagePicker.getMediaLibraryPermissionsAsync()
    if (!settingsCam.granted || !settingsMedia.granted) {
        const requestCam = ImagePicker.requestCameraPermissionsAsync()
        const requestMedia = ImagePicker.requestMediaLibraryPermissionsAsync()
    }
}


const ImgPicker = props => {
    const {colors} = props.theme
    const [pickedImg, setPickedImg] = useState(props.prePicture)



    const pickImage = async () => {
        await checkCameraPermission()
        if (Platform.OS !== 'web') {
            const resCamPermissions = await ImagePicker.getCameraPermissionsAsync()

            const resMediaLibraryPermissions = await ImagePicker.getMediaLibraryPermissionsAsync()

            if (resCamPermissions.status !== 'granted' || resMediaLibraryPermissions.status !== 'granted') {
                alert('Sorry, we need camera and MediaLibrary permissions to make this work!');
                return
            }
        }
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            aspect: [4, 3],
            quality: 0.3,
            base64: true
        })

        if (!result) console.log('no res') //todo: throw error and show dialog to user
        // let retrievedRes = await ImagePicker.getPendingResultAsync()
        // if (retrievedRes) console.log(retrievedRes)

        if (!result.cancelled) {
            setPickedImg(result.uri)
            // Forward it to parent component
            props.onImageTaken({uri: result.uri, base64: result.base64})

        } else console.log('err')  //todo: throw Error and give user feedback

    }


    return (

        <TouchableCmp onPress={pickImage} useForegound>
            <Card style={styles.container}>
                <View style={styles.imagePicker}>
                    <View style={styles.imagePreview}>
                        {!pickedImg
                            ? <IconButton icon='camera' size={40} onPress={pickImage} color={colors.primary}/>
                            : (<Image style={styles.image} source={{uri: pickedImg}}/>)}
                    </View>
                </View>
            </Card>

        </TouchableCmp>

    )
}


const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        marginHorizontal: 5,
    },
    imagePicker: {
        alignItems: 'center',

    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePreview: {
        width: '100%',
        height: 250,
        marginBottom: 0,
        justifyContent: 'center',
        alignItems: 'center',


    }
})

export default withTheme(ImgPicker);

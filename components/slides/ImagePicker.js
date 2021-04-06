import React, {useState} from 'react'
import {
    View,
    StyleSheet,
    Image,
    Platform,
    TouchableNativeFeedback,
    TouchableOpacity,
} from 'react-native'
import {IconButton, Card, TouchableRipple, withTheme} from "react-native-paper";
import * as ImagePicker from 'expo-image-picker'



let TouchableCmp = TouchableOpacity

if (Platform.OS === 'android' && Platform.Version >= 21) {
    TouchableCmp = TouchableNativeFeedback
}


const ImgPicker = props => {

    const [pickedImg, setPickedImg] = useState(props.prePicture)


    const {colors} = props.theme
  //  useEffect(() => console.log(props.prePicture))

    if (Platform.OS === 'android' && Platform.Version >= 21) {
        TouchableCmp = TouchableNativeFeedback
    }

    const pickImage = async () => {
        if (Platform.OS !== 'web') {
            const resCamPermissions= await ImagePicker.getCameraPermissionsAsync()

            const resMediaLibraryPermissions = await ImagePicker.getMediaLibraryPermissionsAsync()

            if (resCamPermissions.status !== 'granted' || resMediaLibraryPermissions.status !== 'granted') {
                alert('Sorry, we need camera and MediaLibrary permissions to make this work!');
                return
            }

        console.log('first')
        }
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            aspect: [4, 3],
            quality: 0.3,
            base64: true
        })


        if (!result) console.log('no res')
        // let retrievedRes = await ImagePicker.getPendingResultAsync()
        // if (retrievedRes) console.log(retrievedRes)

        if (!result.cancelled) {
            setPickedImg(result.uri)
            console.log('set')
            // Forward it to parent component
            props.onImageTaken({uri: result.uri, base64: result.base64})

        }
        else console.log('err')


    }


    return (

            <TouchableCmp  onPress={pickImage} useForegound>
                <Card style={styles.container}>
                    {/*<Card.Title right={(props) => <IconButton {...props} icon='help' onPress={showDialog} />}/>*/}
                    <View style={styles.imagePicker}>
                        <View style={styles.imagePreview}>
                            {!pickedImg ?
                                <IconButton icon='camera' size={40} onPress={pickImage} color={colors.primary}/>
                                :
                                (<Image style={styles.image} source={{uri: pickedImg}}/>)}
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

import React, {useState, useEffect} from 'react'
import {View, StyleSheet, ScrollView, Alert} from 'react-native'
import {List} from "react-native-paper";


import ImagePicker from "./ImagePicker";
import CtmSubheading from "../wrapper/CtmSubheading";
import CtmDialog from "../helper/CtmDialog";
import * as Permissions from "expo-permissions";
import * as Location from "expo-location";



const PictureSlide = ({isComplete, savedData}) => {

    const [selectedSkyImage, setSelectedSkyImage] = useState(savedData?.sky)
    const [selectedHorizonImage, setSelectedHorizonImage] = useState(savedData?.horizon)
    const [userLoc, setUserLoc] = useState()

    const [iconSkyImg, setIconSkyImg] = useState('camera')
    const [iconHorImg, setIconHorImg] = useState('camera')
    const [visibleDialog, setVisibleDialog] = useState(false)
    const [helpText, setHelpText] = useState('')


    const showDialog = () => setVisibleDialog(true);
    const hideDialog = () => setVisibleDialog(false);

    const imageSkyTakenHandler = imgObj => {
        setSelectedSkyImage(imgObj)
        setIconSkyImg('check')
    }
    const imageHorizonTakenHandler = imgObj => {
        setSelectedHorizonImage(imgObj)
        setIconHorImg('check')
    }

    useEffect(() => {
        const getUserLocation = async () => {

            // LocationPermissions
            let locationPermissions
            let locationStatusObj = await Permissions.getAsync(Permissions.LOCATION)
            if (locationStatusObj.status !== 'granted') {
                locationStatusObj = await Permissions.askAsync(Permissions.LOCATION)
            }
            if (locationStatusObj.status !== 'granted') {
                Alert.alert('Insufficient permissions!', 'You need to grand permissions to use location for this app',
                    [{text: 'Okay'}])
                locationPermissions = false
            } else locationPermissions = true // put in store?

            if (!locationPermissions) {
                // todo: show dialog to user
                throw new Error('Permission to access location was denied')
                return
            }
            let location = await Location.getCurrentPositionAsync({accuracy: 5})
            if (location) setUserLoc({lat: location.coords.latitude, lng: location.coords.longitude})

        }
        if (selectedSkyImage) getUserLocation()
    }, [selectedSkyImage])

    useEffect(() => {
        if (selectedSkyImage && selectedHorizonImage && userLoc) {
            isComplete(selectedSkyImage, selectedHorizonImage, userLoc)
        }

    },[selectedSkyImage,selectedHorizonImage])



    const showHelpDialogSkyHandler = () => {
        setHelpText('Schau durch deine Kamera in Richtung des Himmels über dir, und mach ein Foto')
        showDialog()
    }

    const showHelpDialogHorizonHandler = () => {
        setHelpText('Schau durch deine Kamera in Richtung des Horizonts, und mach ein Foto')
        showDialog()
    }


    return (
        <ScrollView>
            <View style={{flex: 1}}>
                <CtmSubheading style={styles.label}>Hier sollst du ein Foto vom den Wolken über dir, und ein Foto vom Horizont vor dir machen.</CtmSubheading>
                <List.AccordionGroup>
                    <List.Accordion id='0'  title='Mach ein Foto vom Himmel' titleNumberOfLines={2}
                                    left={props => <List.Icon {...props} icon={iconSkyImg}/>}  onLongPress={showHelpDialogSkyHandler}>
                        <ImagePicker key={0} onImageTaken={imageSkyTakenHandler}
                                     prePicture={savedData?.sky?.uri}
                                     title=''/>
                    </List.Accordion>
                    <List.Accordion id='1' title='Mach ein Foto vom Horizont' titleNumberOfLines={2}
                                    left={props => <List.Icon {...props} icon={iconHorImg}/>}  onLongPress={showHelpDialogHorizonHandler} >
                        <ImagePicker key={1} onImageTaken={imageHorizonTakenHandler}
                                     prePicture={savedData?.horizon?.uri}
                                     title=''/>
                    </List.Accordion>

                </List.AccordionGroup>
                <CtmDialog visible={visibleDialog} showDialog={showDialog} hideDialog={hideDialog} title='Hilfe' helpText={helpText}/>



            </View>
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    label: {},

})

export default PictureSlide;

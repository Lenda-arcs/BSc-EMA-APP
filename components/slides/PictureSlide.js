import React, {useState, useEffect} from 'react'
import {View, StyleSheet, ScrollView, Alert} from 'react-native'
import {List} from "react-native-paper";

import ImagePicker from "./ImagePicker";
import CtmSubheading from "../wrapper/CtmSubheading";
import CtmDialog from "../helper/CtmDialog";



const PictureSlide = ({isComplete, savedData}) => {

    const [selectedSkyImage, setSelectedSkyImage] = useState(savedData?.sky)
    const [selectedHorizonImage, setSelectedHorizonImage] = useState(savedData?.horizon)

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
        if (selectedSkyImage && selectedHorizonImage) {
            isComplete(selectedSkyImage, selectedHorizonImage)
        }

    },[selectedSkyImage,selectedHorizonImage])


    const showHelpDialogSkyHandler = () => {
        setHelpText('Mach ein Foto vom Himmel über Dir.')
        showDialog()
    }

    const showHelpDialogHorizonHandler = () => {
        setHelpText('Mach ein Foto vom Horizont (vor Dir).')
        showDialog()
    }


    return (
        <ScrollView>
            <View style={{flex: 1}}>
                <CtmSubheading>Bitte mache Fotos von dem Himmel.</CtmSubheading>
                <List.AccordionGroup>
                    <List.Accordion id='0'  title='Mach ein Foto vom Himmel' titleNumberOfLines={2}
                                    left={props => <List.Icon {...props} icon={iconSkyImg}/>}
                                    onLongPress={showHelpDialogSkyHandler}>
                        <ImagePicker key={0} onImageTaken={imageSkyTakenHandler}
                                     prePicture={savedData?.sky?.uri}
                                     title=''/>
                    </List.Accordion>
                    <List.Accordion id='1' title='Mach ein Foto vom Horizont' titleNumberOfLines={2}
                                    left={props => <List.Icon {...props} icon={iconHorImg}/>}
                                    onLongPress={showHelpDialogHorizonHandler} >
                        <ImagePicker key={1} onImageTaken={imageHorizonTakenHandler}
                                     prePicture={savedData?.horizon?.uri}
                                     title=''/>
                    </List.Accordion>
                </List.AccordionGroup>
                <CtmDialog visible={visibleDialog}
                           showDialog={showDialog}
                           hideDialog={hideDialog}
                           title='Hilfe' helpText={helpText}/>
            </View>
        </ScrollView>
    )
}



export default PictureSlide;

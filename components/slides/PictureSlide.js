import React, {useState, useEffect} from 'react'
import {View, StyleSheet, ScrollView, Image, Dimensions} from 'react-native'
import {List, FAB, Paragraph, withTheme} from "react-native-paper";

import ImagePicker from "./ImagePicker";
import CtmSubheading from "../wrapper/CtmSubheading";
import CtmDialog from "../helper/CtmDialog";
import FABPicture from "../helper/FABPictureHelp";
import * as Location from "expo-location";

const dim = Dimensions.get('window')
const imgH = Math.round(dim.width * 4 / 3) *.5
const imgW = dim.width * .75

const resizeMode = 'cover'




const checkLocationPermission = async () => {
    const settings = await Location.getForegroundPermissionsAsync()
    if (!settings.granted) {
        const request = await Location.requestForegroundPermissionsAsync()
    }
}

const PictureSlide = ({isComplete, savedData, theme}) => {
    const {colors} = theme

    const [selectedSkyImage, setSelectedSkyImage] = useState(savedData?.sky)
    const [selectedHorizonImage, setSelectedHorizonImage] = useState(savedData?.horizon)

    const [expandedId, setExpandedId] = useState(undefined);

    const [iconSkyImg, setIconSkyImg] = useState('camera')
    const [iconHorImg, setIconHorImg] = useState('camera')
    const [visibleDialog, setVisibleDialog] = useState(false)
    const [helpText, setHelpText] = useState('')
    const [dialogContent, setDialogContent] = useState('')


    const content = (
        <View style={styles.container}>
            {dialogContent === 'inside' ? <><Image resizeMode={resizeMode} style={styles.img}
                                                   source={require('./../../assets/skyPictures/inside_vertical.jpg')}/>
                    <Image resizeMode={resizeMode} style={styles.img}
                           source={require('./../../assets/skyPictures/inside_horizontal.jpg')}/></> :
                <><Image  resizeMode={resizeMode} style={styles.img}
                         source={require('./../../assets/skyPictures/outside_vertical.jpg')}/>
                    <Image resizeMode={resizeMode} style={styles.img}
                           source={require('./../../assets/skyPictures/outside_horizontal.jpg')}/></>}
        </View>)

    const onAccordionPressHandler = (newExpandedId) =>
        expandedId === newExpandedId
            ? setExpandedId(undefined)
            : setExpandedId(newExpandedId);

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
        checkLocationPermission()
    } ,[])

    useEffect(() => {
        if (selectedSkyImage && selectedHorizonImage) {
            isComplete(selectedSkyImage, selectedHorizonImage)
        }

    }, [selectedSkyImage, selectedHorizonImage])


    const showHelpDialogSkyHandler = () => {
        setHelpText('Mach ein Foto vom Himmel über Dir.')
       // showDialog()
    }

    const showHelpDialogHorizonHandler = () => {
        setHelpText('Mach ein Foto vom Horizont (vor Dir).')
      //  showDialog()
    }


    const collapseAccordionHandler = () => {
        setExpandedId(undefined)
    }

    const showDialogHandler = (type) => {
        setDialogContent(type)
        showDialog()
    }

    return (
        <ScrollView contentContainerStyle={{height: '100%', justifyContent: 'space-between'}}>
            <View>
                <CtmSubheading>Bitte mache Fotos von dem Himmel.</CtmSubheading>
                <List.AccordionGroup onAccordionPress={onAccordionPressHandler} expandedId={expandedId}>
                    <List.Accordion id='0' title='Mach ein Foto vom Himmel' titleNumberOfLines={2}
                                    left={props => <List.Icon {...props} color={ iconSkyImg !== 'check' ? colors.accent : colors.primary} icon={iconSkyImg}/>}
                                    onLongPress={showHelpDialogSkyHandler}>
                        <ImagePicker key={0} onImageTaken={imageSkyTakenHandler}
                                     prePicture={savedData?.sky?.uri}
                                     title=''/>
                    </List.Accordion>
                    <List.Accordion id='1' title='Mach ein Foto vom Horizont' titleNumberOfLines={2}
                                    left={props => <List.Icon  {...props} color={ iconHorImg !== 'check' ? colors.accent : colors.primary}  icon={iconHorImg}/>}
                                    onLongPress={showHelpDialogHorizonHandler}>
                        <ImagePicker key={1} onImageTaken={imageHorizonTakenHandler}
                                     prePicture={savedData?.horizon?.uri}
                                     title=''/>
                    </List.Accordion>
                </List.AccordionGroup>

                <CtmDialog content={content}
                           helpText={dialogContent === 'inside' ? 'Öffne das nächstgelegende Fenster und mache zwei Fotos im Hochformat, wie in diesem Beispiel.' : 'Mache zwei Fotos im Hochformat, und pass auf, dass Dir nichts passiert'}
                           title={dialogContent === 'inside' ? 'Hilfe: Fotos drinnen': 'Hilfe: Fotos draußen'}
                           visible={visibleDialog}  showDialog={showDialogHandler} hideDialog={hideDialog}/>
            </View>
            <FABPicture showDialog={showDialogHandler} collapseAcc={collapseAccordionHandler}/>

        </ScrollView>


    )
}

const styles = StyleSheet.create({
    img: {
        height: imgH,
        width: imgW,
        marginBottom: 10,
        borderRadius: 5,
    },
    container: {
        paddingTop: 10,
        alignSelf: 'flex-start',

    }
})

export default withTheme(PictureSlide);

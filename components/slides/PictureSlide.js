import React, {useState, useEffect} from 'react'
import {View, StyleSheet, ScrollView, Image, Dimensions, ImageBackground} from 'react-native'
import {List, withTheme, Subheading} from "react-native-paper";

import ImagePicker from "./ImagePicker";
import CtmSubheading from "../wrapper/CtmSubheading";
import CtmDialog from "../helper/CtmDialog";
import FABPicture from "../helper/FABPictureHelp";
import * as Location from "expo-location";

const dim = Dimensions.get('window')
const imgH = Math.round(dim.width * 4 / 3) * .5
const imgW = dim.width * .75

const resizeMode = 'cover'


const checkLocationPermission = async () => {
    const settings = await Location.getForegroundPermissionsAsync()
    if (!settings.granted) {
        await Location.requestForegroundPermissionsAsync()
    }
}

const examplePics = {
    inside: {
        title: 'Beispiel Fotos: drinnen',
        text: 'Öffen Sie das nächstgelegende Fenster und machen Sie zwei Fotos im Hochformat, wie es in diesen Beispiel Fotos gezeigt wird.',
        pictureArr: [require('./../../assets/skyPictures/inside_vertical.jpg'), require('./../../assets/skyPictures/inside_horizontal.jpg')]
    },
    outside: {
        title: 'Beispiel Fotos: draußen',
        text: 'Machen Sie zwei Fotos von Himmel im Hochformat, wie es in diesen Beispiel Fotos gezeigt wird.',
        pictureArr: [require('./../../assets/skyPictures/outside_vertical.jpg'), require('./../../assets/skyPictures/outside_horizontal.jpg')]
    }
}

const ExamplePicture = ({src, labelKey}) => (
    <ImageBackground resizeMode={resizeMode}
                     style={styles.img}
                     source={src}>
        <Subheading style={styles.imgTitle}>{labelKey === 0 ? 'Himmel' : 'Horizont'}</Subheading>
    </ImageBackground>
)

const PictureSlide = ({isComplete, savedData, theme}) => {
    const {colors} = theme

    const [selectedSkyImage, setSelectedSkyImage] = useState(savedData?.sky)
    const [selectedHorizonImage, setSelectedHorizonImage] = useState(savedData?.horizon)

    const [expandedId, setExpandedId] = useState(undefined);

    const [iconSkyImg, setIconSkyImg] = useState('camera')
    const [iconHorImg, setIconHorImg] = useState('camera')
    const [visibleDialog, setVisibleDialog] = useState(false)
    const [dialogContent, setDialogContent] = useState('')


    const content = (
        <View style={styles.container}>
            {examplePics?.[dialogContent]?.pictureArr.map((el, index) => <ExamplePicture labelKey={index} key={index} src={el}/>)}
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
    }, [])

    useEffect(() => {
        if (selectedSkyImage && selectedHorizonImage) {
            isComplete(selectedSkyImage, selectedHorizonImage)
        }
    }, [selectedSkyImage, selectedHorizonImage])


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
                <CtmSubheading>Bitte machen Sie jetzt Fotos vom Himmel.</CtmSubheading>
                <List.AccordionGroup
                    onAccordionPress={onAccordionPressHandler}
                    expandedId={expandedId}>
                    <List.Accordion
                        id='0'
                        title='Foto vom Himmel'
                        titleNumberOfLines={2}
                        onLongPress={() => {
                        }}
                        left={props =>
                            <List.Icon
                                {...props}
                                color={iconSkyImg !== 'check' ? colors.accent : colors.primary}
                                icon={iconSkyImg}
                            />}
                    >
                        <ImagePicker
                            key={0}
                            onImageTaken={imageSkyTakenHandler}
                            prePicture={savedData?.sky?.uri}
                            title=''/>
                    </List.Accordion>
                    <List.Accordion
                        id='1'
                        title='Foto vom Horizont'
                        titleNumberOfLines={2}
                        onLongPress={() => {
                        }}
                        left={props =>
                            <List.Icon
                                {...props}
                                color={iconHorImg !== 'check' ? colors.accent : colors.primary}
                                icon={iconHorImg}/>}
                    >
                        <ImagePicker
                            key={1}
                            onImageTaken={imageHorizonTakenHandler}
                            prePicture={savedData?.horizon?.uri}
                            title=''/>
                    </List.Accordion>
                </List.AccordionGroup>

                <CtmDialog content={content}
                           helpText={examplePics?.[dialogContent]?.text}
                           title={examplePics?.[dialogContent]?.title}
                           visible={visibleDialog}
                           showDialog={showDialogHandler}
                           hideDialog={hideDialog}/>
            </View>
            <FABPicture
                showDialog={showDialogHandler}
                collapseAcc={collapseAccordionHandler}
            />
        </ScrollView>


    )
}

const styles = StyleSheet.create(
    {
        img: {
            height: imgH,
            width: imgW,
            marginBottom: 10,
            borderRadius: 5,
            justifyContent: 'center',
            alignItems: 'center'
        },
        imgTitle: {
            color: 'white'
        },
        container: {
            paddingTop: 10,
            alignSelf: 'flex-start',
            borderRadius: 5
        }
    })

export default withTheme(PictureSlide);

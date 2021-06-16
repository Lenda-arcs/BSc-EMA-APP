import React, { useState } from 'react'
import {View, ScrollView, StyleSheet} from "react-native";
import {Paragraph, DataTable} from "react-native-paper";
import Screen from "../components/wrapper/Screen";
import {fetchData} from "../helpers/fetchFactories";
import {useSelector} from "react-redux";
import vars from '../env'
import CtmButton from "../components/wrapper/CtmButton";
import CtmDialog from "../components/helper/CtmDialog";
import * as storeFac from "../helpers/asyncStoreFactories";
import {ASSESSMENT_DATA} from "../store/actions/assessment";

function getAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
function toTime(date) {
    const dateObj = new Date(date)
    return  Math.round(dateObj.getTime() / 1000 / 60 )
}



const {OwnApiUrl} = vars
const UserRow = ({user, userLookUp}) => {
    const currentTime = new Date().getTime()
    const nextTrigger = user.notificationTimes?.find(t => t >= currentTime)
    const nextTriggerDate = (new Date(nextTrigger)).toLocaleTimeString()
    const os = user.deviceType?.os ? user.deviceType?.os : 'N/A'


    return (
        <DataTable.Row>
            <DataTable.Cell onPress={() => userLookUp(user.id)}>{user.userId}</DataTable.Cell>
            <DataTable.Cell>{user.userProgress} / {user.assessmentRepeats}</DataTable.Cell>
            <DataTable.Cell>{user.group}</DataTable.Cell>
            <DataTable.Cell>{user.createdAt.substring(0, 10)}</DataTable.Cell>
            <DataTable.Cell>{nextTriggerDate}</DataTable.Cell>
            <DataTable.Cell>{os}</DataTable.Cell>
        </DataTable.Row>)
}

const AssessmentRow = ({data, fetchAssessment}) => {
    // const [pics, setPics] = useState()
    // const [visible, setVisible] = useState(false)
    // const [dialogContent, setDialogContent] = useState('')

    //
    // const showDialog = () => setVisible(true);
    // const hideDialog = () => setVisible(false);

    const calcAffectScore = (affectObj) => {
        let score = 0
        const valArr = Object.values(affectObj)

        const calcValues = (posIndex, negIndex) => {
            return  valArr[negIndex] -valArr[posIndex]
        }
        score += calcValues(10, 1)
        score += calcValues(4, 11)
        score += calcValues(7, 9)
        score += calcValues(6, 1)
        score += calcValues(2, 8)
        score += calcValues(5, 3)

        return score

    }

    const reducer = (acc, currentVal) => acc + currentVal
    const weatherCloudData = data.weather?.OBSERVATIONS.cloud_layer_1_value_1d
    const skyCondition = weatherCloudData?.value.sky_condition ? weatherCloudData.value.sky_condition : 'N/A'
    const cloudLayer1Height = weatherCloudData?.value.height_agl ? weatherCloudData.value.height_agl : 'N/A'
    //
    // const showDialogHandler = (type) => {
    //     setDialogContent(type)
    //     showDialog()
    // }
    //
    // const content = <View>
    //
    // </View>

    const getPics = async () => {
       //  const pics = (await fetchAssessment(data.id)).images
       // setPics(pics)
    }

    // console.log(pics)

    return (
        <>
        <DataTable.Row onPress={getPics} >
            <DataTable.Cell style={styles.smallCell} numeric >{toTime(data.timestamp.assessmentEnd) - toTime(data.timestamp.assessmentStart)}</DataTable.Cell>
            <DataTable.Cell style={styles.smallCell} >{calcAffectScore(data.answers?.["affect"])}</DataTable.Cell>
            <DataTable.Cell style={styles.smallCell} >{(Object.values(data.answers?.["stress"]).reduce(reducer) / 3).toFixed(1)}</DataTable.Cell>
            <DataTable.Cell style={styles.smallCell}>{(Object.values(data.answers?.["ruminate"]).reduce(reducer) / 3).toFixed(1)}</DataTable.Cell>
            <DataTable.Cell style={styles.smallCell}>{(Object.values(data.answers?.["pre-assessment"])[3]) === 0 ? 'in' : 'out'}</DataTable.Cell>
            <DataTable.Cell style={styles.midCell}>{cloudLayer1Height}</DataTable.Cell>
            <DataTable.Cell style={styles.midCell}>{skyCondition}</DataTable.Cell>
        </DataTable.Row>
            {/*<CtmDialog content={content}*/}
            {/*           title={'FOTOS'}*/}
            {/*           visible={visible}*/}
            {/*           showDialog={showDialogHandler}*/}
            {/*           hideDialog={hideDialog}/>*/}
        </>
    )
}


const AdminScreen = () => {
    const {token} = useSelector(state => state.auth)
    const [users, setUsers] = useState([])
    const [slides, setSlides] = useState(null)
    const [userAssessmentDetails, setUserAssessmentDetails] = useState(null)


    const getOneAssessment = async (assessmentID) => {
        const assessmentRes = await fetchData(`${OwnApiUrl}/assessments/${assessmentID}`, 'GET', null, token)
        const assessmentData = assessmentRes.data.data

        return assessmentData
    }

    const getUser = async () => {
        if (!slides) {
            const asyncStoreSlides = await storeFac.getItemAsyncStore(ASSESSMENT_DATA, false, true)
            setSlides(asyncStoreSlides)
        }

        const usersRes = await fetchData(`${OwnApiUrl}/users?sort=-userProgress`, 'GET', null, token)
        const usersData = usersRes.data.data
        setUsers(usersData)
    }

    const demoPickMapping = (pickId) => {
        const slideId = pickId - 1
        const demoSlideIndex = slides.findIndex(el => el.name === 'demo')
        const demoAnswers = userAssessmentDetails?.find(ass => ass.answers["demo"])?.answers?.["demo"]
        if (pickId == 6) return getAge(demoAnswers?.[pickId].split('T')[0])
        return slides[demoSlideIndex].questions[slideId].selectionItems[demoAnswers?.[pickId]]
    }

    const userLookUpHandler = async (id) => {
        const userDetailsRes = await fetchData(`${OwnApiUrl}/assessments?user=${id}&fields=-images,-user`, 'GET', null, token)
        const userDetailsData = userDetailsRes.data.data
        setUserAssessmentDetails(userDetailsData)
    }
    return (
        <Screen>
            <View style={{flex: 1}}>
                {!userAssessmentDetails ? <><Paragraph style={{alignSelf: 'center'}}>Total
                        Users: {users.length}</Paragraph><DataTable>
                        <DataTable.Header>
                            <DataTable.Title>Name</DataTable.Title>
                            <DataTable.Title>Repeats</DataTable.Title>
                            <DataTable.Title>Group</DataTable.Title>
                            <DataTable.Title>Created</DataTable.Title>
                            <DataTable.Title>Next Trigger</DataTable.Title>
                            <DataTable.Title>OS</DataTable.Title>
                        </DataTable.Header>
                        <ScrollView contentContainerStyle={{paddingBottom: 600}}>
                            {users?.map((user, index) => <UserRow key={index} user={user} userLookUp={userLookUpHandler}/>)}
                        </ScrollView>

                    </DataTable></> :
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title style={styles.smallCell}>Geschlecht</DataTable.Title>
                            <DataTable.Title style={styles.midCell}>Status</DataTable.Title>
                            <DataTable.Title style={styles.smallCell}>Alters</DataTable.Title>
                            <DataTable.Title style={styles.bigCell}>Abschluss</DataTable.Title>
                            <DataTable.Title style={styles.smallCell}>Beziehung</DataTable.Title>
                        </DataTable.Header>
                        <DataTable.Row>
                            <DataTable.Cell style={styles.smallCell}>{demoPickMapping(1)}</DataTable.Cell>
                            <DataTable.Cell style={styles.midCell}>{demoPickMapping(3)}</DataTable.Cell>
                            <DataTable.Cell style={styles.smallCell}>{demoPickMapping(6)}</DataTable.Cell>
                            <DataTable.Cell style={styles.bigCell}>{demoPickMapping(2)}</DataTable.Cell>
                            <DataTable.Cell style={styles.smallCell}>{demoPickMapping(5)}</DataTable.Cell>
                        </DataTable.Row>
                        <DataTable.Header>
                            <DataTable.Title style={styles.smallCell}>Duration</DataTable.Title>
                            <DataTable.Title style={styles.smallCell}>Affekt</DataTable.Title>
                            <DataTable.Title style={styles.smallCell}>Stress</DataTable.Title>
                            <DataTable.Title style={styles.smallCell}>Grübeln</DataTable.Title>
                            <DataTable.Title style={styles.smallCell}>Ort</DataTable.Title>
                            <DataTable.Title style={styles.midCell}>Wolkenhöhe</DataTable.Title>
                            <DataTable.Title style={styles.midCell}>Bedeckung</DataTable.Title>
                        </DataTable.Header>
                        <ScrollView>
                            {userAssessmentDetails.map((assessment, index) => <AssessmentRow key={index} index={index}
                                                                                             data={assessment} fetchAssessment={getOneAssessment}/>)}
                        </ScrollView>

                    </DataTable>}

            </View>
            {!userAssessmentDetails ?
                <CtmButton onPress={getUser}>{users.length > 0 ? 'Refresh' : 'Get User'}</CtmButton> :
                <CtmButton onPress={() => setUserAssessmentDetails(null)}>Back</CtmButton>}
        </Screen>
    )


}

export default AdminScreen


const styles = StyleSheet.create({
    smallCell: {
        maxWidth: '10%',
        justifyContent: 'center'
    },
    midCell: {
        maxWidth: '25%',
        justifyContent: 'center'
    },
    bigCell: {
        maxWidth: '35%',
        justifyContent: 'center'
    }
})

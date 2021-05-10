import React, {useEffect, useState} from 'react'
import {View, Text, ScrollView} from "react-native";
import {Paragraph, Card, DataTable} from "react-native-paper";
import Screen from "../components/wrapper/Screen";
import {fetchData} from "../helpers/fetchFactories";
import {useSelector} from "react-redux";
import ENV from '../env'
import CtmButton from "../components/wrapper/CtmButton";
import assessment from "../store/reducers/assessment";


const UserRow = ({user, userLookUp}) => {
    const currentTime = new Date().getTime()
    const nextTrigger = user.notificationTimes?.find(t => t >= currentTime)
    const nextTriggerDate = (new Date(nextTrigger)).toLocaleTimeString()


    return (
        <DataTable.Row>
            <DataTable.Cell onPress={() => userLookUp(user.id)}>{user.userId}</DataTable.Cell>
            <DataTable.Cell>{user.userProgress} / {user.assessmentRepeats}</DataTable.Cell>
            <DataTable.Cell>{user.group}</DataTable.Cell>
            <DataTable.Cell>{user.createdAt.substring(0, 10)}</DataTable.Cell>
            <DataTable.Cell>{nextTriggerDate}</DataTable.Cell>
        </DataTable.Row>)
}

const AssessmentRow = ({data}) => {

    const calcAffectScore = (affectObj) => {
        let score = 0
        const valArr = Object.values(affectObj)

        const calcValues = (posIndex, negIndex) => {
            return valArr[posIndex] - valArr[negIndex]
        }
        score += calcValues(10, 1)
        score += calcValues(4, 11)
        score += calcValues(7, 9)
        score += calcValues(6, 1)
        score += calcValues(2, 8)
        score += calcValues(5, 3)

        return score

    }
    const toTime = (date) => {
        const dateObj = new Date(date)
        return  Math.round(dateObj.getTime() / 1000 / 60 )
    }
    const reducer = (acc, currentVal) => acc + currentVal

    return (
        <DataTable.Row>
            <DataTable.Cell>{toTime(data.timestamp.assessmentEnd) - toTime(data.timestamp.assessmentStart)}</DataTable.Cell>
            <DataTable.Cell>{calcAffectScore(data.answers?.affect)}</DataTable.Cell>
            <DataTable.Cell>{(Object.values(data.answers?.stress).reduce(reducer) / 3).toFixed(1)}</DataTable.Cell>
            <DataTable.Cell>{(Object.values(data.answers?.ruminate).reduce(reducer) / 3).toFixed(1)}</DataTable.Cell>
            <DataTable.Cell>{(Object.values(data.answers?.["pre-assessment"])[3]) === 0 ? 'in' : 'out'}</DataTable.Cell>
            <DataTable.Cell>{data.weather.OBSERVATIONS.cloud_layer_1_value_1d.value.height_agl}</DataTable.Cell>
            <DataTable.Cell>{data.weather.OBSERVATIONS.cloud_layer_1_value_1d.value.sky_condition}</DataTable.Cell>
        </DataTable.Row>
    )
}


const AdminScreen = (props) => {
    const {token} = useSelector(state => state.auth)
    const [users, setUsers] = useState([])
    const [slides, setSlides] = useState([])
    const [userAssessmentDetails, setUserAssessmentDetails] = useState(null)



    const getUser = async () => {
        const slideDataRes = await fetchData(`${ENV.OwnApi}/slides`, 'GET', null, token)
        const slideData = slideDataRes.data.data
        setSlides(slideData)

        const usersRes = await fetchData(`${ENV.OwnApi}/users`, 'GET', null, token)
        const usersData = usersRes.data.data
        setUsers(usersData)
    }

    const demoPickMapping = (pickId) => {
        const slideId = pickId - 1
        const demoSlide = slides.findIndex(el => el.name === 'demo')
        return slides[0].questions[slideId].selectionItems[userAssessmentDetails?.[userAssessmentDetails.length - 1]?.answers?.demo?.[pickId]]
    }

    const userLookUpHandler = async (id) => {
        const userDetailsRes = await fetchData(`${ENV.OwnApi}/assessments?user=${id}&fields=-images,-user`, 'GET', null, token)
        const userDetailsData = userDetailsRes.data.data


        setUserAssessmentDetails(userDetailsData)
    }
    return (
        <Screen>
            <View style={{flex: 1}}>
                {!userAssessmentDetails ?
                    <CtmButton onPress={getUser}>{users.length > 0 ? 'Refresh' : 'Get User'}</CtmButton> :
                    <CtmButton onPress={() => setUserAssessmentDetails(null)}>Back</CtmButton>}
                {!userAssessmentDetails ? <><Paragraph style={{alignSelf: 'center'}}>Total
                        Users: {users.length}</Paragraph><DataTable>
                        <DataTable.Header>
                            <DataTable.Title>Name</DataTable.Title>
                            <DataTable.Title>Repeats</DataTable.Title>
                            <DataTable.Title>Group</DataTable.Title>
                            <DataTable.Title>Created</DataTable.Title>
                            <DataTable.Title>Next Trigger</DataTable.Title>
                        </DataTable.Header>
                        <ScrollView contentContainerStyle={{paddingBottom: 600}}>
                            {users?.map((user, index) => <UserRow key={index} user={user} userLookUp={userLookUpHandler}/>)}
                        </ScrollView>

                    </DataTable></> :
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title>Geschlecht</DataTable.Title>
                            <DataTable.Title>Abschluss</DataTable.Title>
                            <DataTable.Title>Status</DataTable.Title>
                            <DataTable.Title>AltersRange</DataTable.Title>
                        </DataTable.Header>
                        <DataTable.Row>
                            <DataTable.Cell>{demoPickMapping(1)}</DataTable.Cell>
                            <DataTable.Cell>{demoPickMapping(2)}</DataTable.Cell>
                            <DataTable.Cell>{demoPickMapping(3)}</DataTable.Cell>
                            <DataTable.Cell>{demoPickMapping(5)}</DataTable.Cell>
                        </DataTable.Row>
                        <DataTable.Header>
                            <DataTable.Title>Duration</DataTable.Title>
                            <DataTable.Title>Affekt</DataTable.Title>
                            <DataTable.Title>Stress</DataTable.Title>
                            <DataTable.Title>Grübeln</DataTable.Title>
                            <DataTable.Title>Ort</DataTable.Title>
                            <DataTable.Title>Wolkenhöhe</DataTable.Title>
                            <DataTable.Title>Bedeckung</DataTable.Title>
                        </DataTable.Header>
                        <ScrollView>
                            {userAssessmentDetails.map((assessment, index) => <AssessmentRow key={index}
                                                                                             data={assessment}/>)}
                        </ScrollView>

                    </DataTable>}

            </View>
        </Screen>
    )


}

export default AdminScreen

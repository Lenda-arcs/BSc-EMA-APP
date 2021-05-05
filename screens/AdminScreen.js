import React, {useEffect, useState} from 'react'
import {View, Text, ScrollView} from "react-native";
import {Paragraph, Card, DataTable} from "react-native-paper";
import Screen from "../components/wrapper/Screen";
import {fetchData} from "../helpers/fetchFactories";
import {useSelector} from "react-redux";
import ENV from '../env'
import CtmButton from "../components/wrapper/CtmButton";


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

const AssessmentRow = () => (
    <></>
)


const AdminScreen = (props) => {
    const {token} = useSelector(state => state.auth)
    const [users, setUsers] = useState([])
    const [userDetails, setUserDetails] = useState(null)

    useEffect(() => {

    }, [])

    const getUser = async () => {
        const usersRes = await fetchData(`${ENV.OwnApi}/users`, 'GET', null, token)
        const usersData = usersRes.data.data
        setUsers(usersData)
    }

    const userLookUpHandler = async (id) => {
        const userDetailsRes = await fetchData(`${ENV.OwnApi}/users/${id}`, 'GET', null, token)
        const userDetailsData = userDetailsRes.data.data

        setUserDetails(userDetailsData)
    }
    return (
        <Screen>
            <View style={{flex: 1}}>
                <CtmButton onPress={getUser}>{users.length > 0 ? 'Refresh' : 'Get User'}</CtmButton>
                {!userDetails ? <><Paragraph style={{alignSelf:'center'}}>Total Users: {users.length}</Paragraph><DataTable>
                        <DataTable.Header>
                            <DataTable.Title>Name</DataTable.Title>
                            <DataTable.Title>Repeats</DataTable.Title>
                            <DataTable.Title>Group</DataTable.Title>
                            <DataTable.Title>Created</DataTable.Title>
                            <DataTable.Title>Next Trigger</DataTable.Title>
                        </DataTable.Header>
                        <ScrollView>
                            {users?.map((user, index) => <UserRow key={index} user={user} userLookUp={userLookUpHandler}/>)}
                        </ScrollView>

                    </DataTable></> :
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title>Count: {userDetails?.userProgress}</DataTable.Title>
                        </DataTable.Header>
                        <ScrollView>
                            {userDetails.assessments.map((el, index) => <Paragraph
                                key={index}>{el.timestamp.assessmentStart}</Paragraph>)}
                        </ScrollView>
                        <CtmButton onPress={() => setUserDetails(null)}>Back</CtmButton>
                    </DataTable>}

            </View>
        </Screen>
    )


}

export default AdminScreen

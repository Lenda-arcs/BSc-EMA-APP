import React, {useEffect, useState} from 'react'
import {View, Text, ScrollView} from "react-native";
import {Paragraph, Card} from "react-native-paper";
import Screen from "../components/wrapper/Screen";
import {fetchData} from "../helpers/fetchFactories";
import {useSelector} from "react-redux";
import ENV from '../env'
import CtmButton from "../components/wrapper/CtmButton";



const UserCard = ({user}) => (
    <Card >
       <Card.Content style={{ flexDirection: 'row', justifyContent: 'space-around',}}>
           <Paragraph>{user.userId}</Paragraph>
           <Paragraph>{user.group}</Paragraph>
       </Card.Content>
    </Card>
)


const AdminScreen = (props) => {
    const {user, token} = useSelector(state => state.auth)
    const [users, setUsers] = useState([])

    useEffect(() => {

    }, [])

    const getUser = async () => {
        const usersRes = await fetchData(`${ENV.OwnApi}/users`, 'GET', null, token)
        const usersData = usersRes.data.data
        console.log(usersData)
        setUsers(usersData)
    }

    console.log(typeof users)


    return (
        <Screen>
            <View style={{flex: 1}}>
                <CtmButton onPress={getUser}>Get User</CtmButton>
               <ScrollView>
                   {users?.map((user, index) => <UserCard key={index} user={user}/> )}
               </ScrollView>
            </View>
        </Screen>
    )


}

export default AdminScreen

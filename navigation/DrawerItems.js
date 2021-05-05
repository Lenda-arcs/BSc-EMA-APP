import React, {useEffect} from 'react';
import {View, StyleSheet, Platform, SafeAreaView, ScrollView} from 'react-native';
import {Drawer, Switch, TouchableRipple, Text, useTheme} from 'react-native-paper';
import * as Notifications from 'expo-notifications'
import {useDispatch, useSelector} from "react-redux";
import {logout} from "../store/actions/auth";
import {useState} from "react";
import CtmDialog from "../components/helper/CtmDialog";
import {getItemAsyncStore} from "./../helpers/asyncStoreFactories";
import CtmButton from "../components/wrapper/CtmButton";


//todo: get  text from server?
const text = 'diam nonumy eirmod tempor invidunt ut . Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.orem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'

const DrawerItems = ({toggleTheme, isDarkTheme, userType, navigation}) => {

    const {colors} = useTheme();
    const dispatch = useDispatch()
    const [visible, setVisible] = useState(false)
    const [times, setTimes] = useState([])
    const [sTimes, setSTimes] = useState([])

    // todo: delete after testing
    const showNotificationTimes = async () => {
        const currentTime = (new Date()).getTime()
        const times = await getItemAsyncStore('NOTIFICATION_TIMES', false, true)
        const filtered = times.filter(t => (t - currentTime >= 0))
        const dateArr = filtered.map(el => new Date(el))
        setTimes(dateArr.slice(0, 6))
    }

// todo: delete after testing
    const showScheduledTimes = async () => {
        setSTimes([])
        const scheduledTimes = await Notifications.getAllScheduledNotificationsAsync()
        const newARR = scheduledTimes
        let sTimesArr = []
        Platform.OS === 'android' ? scheduledTimes.forEach(el => sTimesArr.push(el.trigger.value)) : scheduledTimes.forEach(el => sTimesArr.push(el.trigger.seconds))
        sTimesArr.sort((a, b) => a - b)
        const sDatesArr = Platform.OS === 'android' ? sTimesArr.map(el => new Date(el)) : sTimesArr.map(el => el)
        setSTimes(sDatesArr.slice(0, 6))
    }


    const hideTimes = () => {
        setTimes([])
        setSTimes([])
    }


    return (
        <View style={[styles.drawerContent, {backgroundColor: colors.surface}]}>
            <View>
                <CtmDialog title='Datenschutz' hideDialog={() => setVisible(false)} visible={visible} helpText={text}/>
                <Drawer.Section title="Einstellungen">
                    <TouchableRipple onPress={toggleTheme}>
                        <View style={styles.preference}>
                            <Text>Dunkle Ansicht</Text>
                            <View pointerEvents="none">
                                <Switch value={isDarkTheme}/>
                            </View>
                        </View>
                    </TouchableRipple>
                </Drawer.Section>
                <Drawer.Section title="Rechtlich">
                    <TouchableRipple onPress={() => setVisible(true)}>
                        <View style={styles.preference}>
                            <Text>Datenschutz</Text>
                        </View>
                    </TouchableRipple>
                </Drawer.Section>
                {userType === 'admin' &&
                <Drawer.Section title="Admin">
                    <TouchableRipple onPress={showNotificationTimes}>
                        <View style={styles.preference}>
                            <Text>Times From Server</Text>

                        </View>
                    </TouchableRipple>
                    {times.length > 0 && times.map((el, index) => <Text style={{marginLeft: 10}}
                                                                        key={index}>{el.toString()}</Text>)}
                    {sTimes.map((el, index) => <Text key={index}
                                                     style={{marginLeft: 10}}>{el.toString()}</Text>)}
                    <TouchableRipple onPress={showScheduledTimes}>
                        <View style={styles.preference}>
                            <Text>Times scheduled</Text>

                        </View>
                    </TouchableRipple>
                    <TouchableRipple onPress={hideTimes}>
                        <View style={styles.preference}>
                            <Text>Hide times</Text>
                        </View>
                    </TouchableRipple>

                    <TouchableRipple onPress={() => navigation.navigate('Admin')}>
                        <View style={styles.preference}>
                            <Text>User</Text>
                        </View>
                    </TouchableRipple>
                </Drawer.Section>}
            </View>
            {userType === 'admin' && <Drawer.Item style={{backgroundColor: colors.surface}} icon='logout' label='logout'
                                                  onPress={() => dispatch(logout())}/>}
        </View>
    );
};

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 25 : 22,
        paddingBottom: Platform.OS === 'android' ? 10 : 18,
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});

export default DrawerItems;

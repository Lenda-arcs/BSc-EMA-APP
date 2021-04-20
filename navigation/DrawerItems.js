import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {Drawer, Switch, TouchableRipple, Text, useTheme} from 'react-native-paper';
import {useDispatch} from "react-redux";
import {logout} from "../store/actions/auth";
import {useState} from "react";
import CtmDialog from "../components/helper/CtmDialog";


//todo: get  text from server?
const text = 'LLorem ipsum dolor sit t, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore etLorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.orem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'

const DrawerItems = ({toggleTheme, isDarkTheme, authStatus, navigation}) => {

    const {colors} = useTheme();

    const dispatch = useDispatch()
    const [visible, setVisible] = useState(false)



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
                    {/*<TouchableRipple onPress={() => {*/}
                    {/*}}>*/}
                    {/*    <View style={styles.preference}>*/}
                    {/*        <Text>Impressum</Text>*/}
                    {/*    </View>*/}
                    {/*</TouchableRipple>*/}
                    <TouchableRipple onPress={() => setVisible(true)}>
                        <View style={styles.preference}>
                            <Text>Datenschutz</Text>
                        </View>
                    </TouchableRipple>
                </Drawer.Section>
                <Drawer.Section title="Feedback">
                    <TouchableRipple onPress={() => navigation.navigate('Feedback')}>
                        <View style={styles.preference}>
                            <Text>Schreib eine Nachricht</Text>
                        </View>
                    </TouchableRipple>
                </Drawer.Section>
            </View>
            {authStatus
                ? <Drawer.Item style={{backgroundColor: colors.surface}} icon='logout' label='logout' onPress={() => dispatch(logout())}/>
                : <Drawer.Item style={{backgroundColor: colors.surface}} icon='login' label='Teilnehmer ID' onPress={() => navigation.navigate('Auth')}/>}
        </View>
    );
};

const styles = StyleSheet.create({
    drawerContent: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 25 : 22,
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
});

export default DrawerItems;

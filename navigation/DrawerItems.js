import React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {Drawer, Switch, TouchableRipple, Text, useTheme} from 'react-native-paper';

import {useDispatch} from "react-redux";
import {logout} from "../store/actions/auth";
import {useState} from "react";
import CtmDialog from "../components/helper/CtmDialog";

//todo: get  text from server?
const text = 'diam nonumy eirmod tempor invidunt ut . Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.orem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'

const DrawerItems = ({toggleTheme, isDarkTheme, userType, navigation}) => {

    const {colors} = useTheme();
    const dispatch = useDispatch()
    const [visible, setVisible] = useState(false)
    const isAdmin = userType === 'admin'


    return (
        <View
            style={[styles.drawerContent, {backgroundColor: colors.surface}]}
        >
            <View>
                <CtmDialog
                    title='Datenschutz'
                    hideDialog={() => setVisible(false)}
                    visible={visible}
                    helpText={text}/>
                <Drawer.Section
                    title="Einstellungen">
                    <TouchableRipple
                        onPress={toggleTheme}>
                        <View
                            style={styles.preference}>
                            <Text>Dunkle Ansicht</Text>
                            <View
                                pointerEvents="none">
                                <Switch
                                    value={isDarkTheme}/>
                            </View>
                        </View>
                    </TouchableRipple>
                </Drawer.Section>
                <Drawer.Section
                    title="Rechtlich">
                    <TouchableRipple
                        onPress={() => setVisible(true)}>
                        <View
                            style={styles.preference}>
                            <Text>Datenschutz</Text>
                        </View>
                    </TouchableRipple>
                </Drawer.Section>
                {isAdmin &&
                <Drawer.Section
                    title="Admin">
                    <TouchableRipple
                        onPress={() => navigation.navigate('Admin')}>
                        <View
                            style={styles.preference}>
                            <Text>Admin</Text>
                        </View>
                    </TouchableRipple>
                </Drawer.Section>}
            </View>
            {isAdmin &&
            <Drawer.Item
                style={{backgroundColor: colors.surface}}
                icon='logout'
                label='logout'
                onPress={() => dispatch(logout())}
            />}
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

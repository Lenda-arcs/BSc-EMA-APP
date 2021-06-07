import React from 'react';
import {View, StyleSheet, Platform, TouchableOpacity} from 'react-native';
import {
    Drawer,
    Switch,
    TouchableRipple,
    Text,
    useTheme,
    Paragraph,
    Subheading, Button
} from 'react-native-paper';

import {useDispatch} from "react-redux";
import {logout} from "../store/actions/auth";

const DrawerItems = ({toggleTheme, isDarkTheme, userType, navigation}) => {

    const {colors} = useTheme();
    const dispatch = useDispatch()
    const isAdmin = userType === 'admin'


    return (
        <View
            style={[styles.drawerContent, {backgroundColor: colors.surface}]}
        >
            <View>
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
                {/*<Drawer.Section*/}
                {/*    title="Rechtlich">*/}
                {/*    <TouchableRipple*/}
                {/*        onPress={() => setVisible(true)}>*/}
                {/*        <View*/}
                {/*            style={styles.preference}>*/}
                {/*            <Text>Datenschutz</Text>*/}
                {/*        </View>*/}
                {/*    </TouchableRipple>*/}
                {/*</Drawer.Section>*/}
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

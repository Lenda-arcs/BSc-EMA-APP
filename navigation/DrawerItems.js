import * as React from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {
    Drawer,
    Switch,
    TouchableRipple,
    Text,
    useTheme,
} from 'react-native-paper';
import {useDispatch} from "react-redux";
import {logout} from "../store/actions/auth";



const DrawerItems = ({toggleTheme, isDarkTheme, authStatus, navigation}) => {

    const {colors} = useTheme();

    const dispatch = useDispatch()



    return (
        <View style={[styles.drawerContent, {backgroundColor: colors.surface}]}>
            <View>
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
                    <TouchableRipple onPress={() => {}}>
                        <View style={styles.preference}>
                            <Text>Impressum</Text>
                        </View>
                    </TouchableRipple>
                    <TouchableRipple onPress={() => {}}>
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
            {/* USE IF NO LOGOUT NEEDED*/}
            {/*{!authStatus ? <Drawer.Item style={{backgroundColor: colors.surface}} icon='login' label='Teilnehmer ID'*/}
            {/*                             onPress={() => navigation.navigate('Auth')}/> : null}*/}

            {/*USE IF LOGOUT NEEDED*/}
            {authStatus ? <Drawer.Item style={{backgroundColor: colors.surface}} icon='logout' label='logout'
                          onPress={() => dispatch(logout())}/>
                          : <Drawer.Item style={{backgroundColor: colors.surface}} icon='login' label='Teilnehmer ID'
                                         onPress={() => navigation.navigate('Auth')}/>}
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

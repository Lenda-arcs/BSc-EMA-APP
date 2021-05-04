import * as React from 'react';
import {Button, Dialog, FAB, Paragraph, Portal, Provider, useTheme} from 'react-native-paper';
import {Image, View, StyleSheet, ScrollView, Dimensions} from "react-native";
import {useState} from "react";
import CtmDialog from "./CtmDialog";


const FABPicture = (props) => {
    const [state, setState] = useState({open: false});

    const {colors} = useTheme()





    const onStateChange = ({open}) => setState({open});

    const {open} = state;

    return (
        <Provider>
            <Portal>
                <FAB.Group color={colors.background} fabStyle={{backgroundColor: colors.accent}}
                           style={{width: '100%', paddingBottom: '10%', paddingRight: '5%'}}
                           open={open}
                           icon={open ? 'camera-plus' : 'information-outline'}
                           actions={[
                               {
                                   icon: 'camera-iris',
                                   label: 'Inside',
                                   onPress: () => props.showDialog('inside'),
                               },
                               {
                                   icon: 'camera-iris',
                                   label: 'Outside',
                                   onPress: () => props.showDialog('outside'),
                               }
                           ]}
                           onStateChange={onStateChange}
                           onPress={() => {
                               if (open) {
                                   // do something if the speed dial is open
                               }
                               props.collapseAcc()
                           }}
                />
            </Portal>
        </Provider>
    );
};

const styles = StyleSheet.create({

});

export default FABPicture;

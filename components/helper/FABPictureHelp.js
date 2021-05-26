import * as React from 'react';
import { FAB, Portal, Provider, useTheme } from 'react-native-paper';
import {useState} from "react";

const FABPicture = (props) => {
    const [state, setState] = useState({open: false});
    const {colors} = useTheme()
    const onStateChange = ({open}) => setState({open});

    const {open} = state;

    return (
        <Provider>
            <Portal>
                <FAB.Group color={colors.background} fabStyle={{backgroundColor: '#35469d'}}
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
                           onPress={() => {props.collapseAcc()}}
                />
            </Portal>
        </Provider>
    );
};

export default FABPicture;

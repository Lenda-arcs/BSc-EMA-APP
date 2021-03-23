import React, {useState} from 'react';
import { View } from 'react-native';
import { Button, Paragraph, Dialog, Portal } from 'react-native-paper';

// Custom Dialog component that can be used to show details or explanation to user
const CtmDialog = (props) => {


    return (
        <View>
            <Portal>
                <Dialog visible={props.visible} onDismiss={props.hideDialog}>
                    <Dialog.Title>{props.title}</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>{props.helpText}</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={props.hideDialog}>Done</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
};

export default CtmDialog;

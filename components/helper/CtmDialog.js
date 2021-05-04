import React, {useState} from 'react';
import {Dimensions, ScrollView, View} from 'react-native';
import { Button, Paragraph, Dialog, Portal, Text } from 'react-native-paper';

const dim = Dimensions.get('window')
// Custom Dialog component that can be used to show details or explanation to user
const CtmDialog = (props) => {


    return (
        <View>
            <Portal>
                <Dialog visible={props.visible} onDismiss={props.hideDialog}>
                    <Dialog.Title>{props.title}</Dialog.Title>

                        <Dialog.Content style={{maxHeight: dim.height * .7}} >
                            <ScrollView>
                                <Paragraph>{props.helpText}</Paragraph>
                                {props.content}
                            </ScrollView>
                        </Dialog.Content>

                        <Dialog.Actions>
                            <Button onPress={props.hideDialog}>OKAY</Button>
                        </Dialog.Actions>


                </Dialog>
            </Portal>
        </View>
    );
};

export default CtmDialog;

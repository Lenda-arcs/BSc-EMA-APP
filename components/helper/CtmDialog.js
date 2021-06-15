import React, {useState} from 'react';
import {Dimensions, ScrollView, Platform, View} from 'react-native';
import {Button, Paragraph, Dialog, Portal, Checkbox, Subheading} from 'react-native-paper';

const dim = Dimensions.get('window')
// Custom Dialog component that can be used to show details or explanation to user


const CtmDialog = (props) => {
    const [checked, setChecked] = useState(false)
    const [index, setIndex] = useState(0)

    const detailsHandler = () => {
        if (index === 1) setIndex(0)
        else setIndex(1)
    }

    const dismiss = !props.checkBox && !props.noHide


    return (
        <View>
            <Portal>
                <Dialog visible={props.visible} onDismiss={dismiss && props.hideDialog}>
                    <Dialog.Title>{props.title}</Dialog.Title>
                    <Dialog.Content style={{maxHeight: dim.height * .7}}>
                        <ScrollView contentContainerStyle={{width: '100%'}}>
                            {props.content
                            && Array.isArray(props.content)
                                ? props.content[index]
                                : props.content}
                            <Paragraph style={{lineHeight: 22}}>{props.helpText}</Paragraph>

                        </ScrollView>
                    </Dialog.Content>

                    <Dialog.Actions style={{flexDirection: 'row'}}>
                        {props?.checkBox
                        && <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <View style={!checked && Platform.OS === 'ios' && {height: 30, width: 30, borderRadius: 5, opacity: .8, borderWidth: 1.5, borderColor: '#ccc' }}>
                                <Checkbox
                                    status={checked ? 'checked' : 'unchecked'}
                                    onPress={() => {
                                        setChecked(!checked)
                                    }}/>
                            </View>
                            <Button
                                onPress={detailsHandler}>
                                {index === 1
                                    ? 'Zurück'
                                    : 'Details'}</Button>
                        </View>}
                        {!props?.noHide &&
                        <Button
                            disabled={props?.checkBox ? !checked : false}
                            onPress={props.hideDialog}
                        >OKAY</Button>}
                    </Dialog.Actions>


                </Dialog>
            </Portal>
        </View>
    );
};

export default CtmDialog;

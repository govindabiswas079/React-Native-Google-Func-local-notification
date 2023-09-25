/* import React, { useEffect, useState } from 'react';
import { startCounter, stopCounter } from 'react-native-accurate-step-counter';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

const NativePadometer = () => {
    const [steps, setSteps] = useState(0);

    useEffect(() => {
        const config = {
            default_threshold: 15.0,
            default_delay: 150000000,
            cheatInterval: 3000,
            onStepCountChange: (stepCount) => { setSteps(stepCount) },
            onCheat: () => { console.log("User is Cheating") }
        }
        startCounter(config);
        return () => { stopCounter() }
    }, []);

    return (
        <View style={styles.screen}>
            <Text style={styles.step}>{steps}</Text>
        </View>
    )
}

export default NativePadometer;

const styles = StyleSheet.create({
    screen: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    step: {
      fontSize: 36
    }
  }); */

import React, { Fragment } from 'react';
import {
    StyleSheet,
    View,
    Text,
    NativeModules,
    NativeEventEmitter,
} from 'react-native';

const { RNWalkCounter } = NativeModules;
const WalkEvent = new NativeEventEmitter({ RNWalkCounter });
let subscription;
const NativePadometer = () => {
    const [steps, setSteps] = React.useState(0);

    function startCounter(config) {
        const default_threshold = config.default_threshold || 15.0;
        const default_delay = config.default_delay || 150000000;
        const cheatInterval = config.cheatInterval || 3000;
        const onStepCountChange = config.onStepCountChange;
        const onCheat = config.onCheat;
        let prevSteps = 0, currSteps = 0, currTime = 0;

        subscription = WalkEvent.addListener('onStepRunning', (event) => {
            if (currTime + cheatInterval < new Date().getTime()) {
                currSteps = Number(event.steps);
                if (onStepCountChange) {
                    onStepCountChange(currSteps + prevSteps);
                }
            }
        });

        RNWalkCounter.startCounter(default_threshold, default_delay)
    }
    function stopCounter() {
        RNWalkCounter.stopCounter();
        if (subscription) {
            subscription.remove();
        }
    }
    React.useEffect(() => {
        const config = {
            default_threshold: 15.0,
            default_delay: 150000000,
            cheatInterval: 3000,
            onStepCountChange: (stepCount) => { setSteps(stepCount) },
            onCheat: () => { console.log("User is Cheating") }
        }
        startCounter(config);
        return () => { stopCounter() }
    }, []);

    return (
        <Fragment>
            <View style={styles.container}>
                <Text>Steps: {steps}</Text>
            </View>
        </Fragment>
    )
}

export default NativePadometer;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
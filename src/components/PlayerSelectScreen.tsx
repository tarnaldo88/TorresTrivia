import {useState} from 'react';  
import { Audio } from 'expo-av';
import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image,
    ImageBackground, 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import thisMegan from '../assets/audio/this/thisisMegan.mp3';
import thisEmilio from '../assets/audio/this/thisisEmilio.mp3';
import thisKai from '../assets/audio/this/thisisKai.mp3';
import thisAmaya from '../assets/audio/this/thisisAmaya.mp3';

export const PlayerSelectScreen: React.FC = () =>  {
    const [playerList, setPlayerList] = useState<string[]>([]);

    const addtoPlayerList = (player:string) => {
        setPlayerList(prev => [...prev, player]);
    };

    const playName = (name: any) => {
        //parameter passes clipname to play upon press
    };

    return(
        <View style= {styles.container}>
            <View>  
                <Text style={styles.playSelectTitle}>Players Selected: </Text>
            </View>
            <View>
                <TouchableOpacity 
                    onPress={() => {
                        addtoPlayerList("Amaya");
                        playName(thisAmaya);
                    }}
                >
                    <Text>Amaya</Text>
                </TouchableOpacity>
            </View>            
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#100d11ff",
        flex: 1,
        
    },
    playerSelectedContainer:{
        
    },
    playSelectTitle: {
        fontSize: 20,
        color: "#2bff01ff",

    },
    buttonGrid:{

    },
});
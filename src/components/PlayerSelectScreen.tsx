import {useState} from 'react';  
import { useAudioPlayer } from 'expo-audio';
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

export const PlayerSelectScreen: React.FC = () =>  {    
    const [playerList, setPlayerList] = useState<string[]>([]);
    const [playerSelected, setPlayerSelected] = useState<boolean>(false);

    const audioPlayers = {
        megan: require('../assets/audio/this/thisisMegan.mp3'),
        emilio: require('../assets/audio/this/thisisEmilio.mp3'),
        amaya: require('../assets/audio/this/thisisAmaya.mp3'),
        kai: require('../assets/audio/this/thisisKai.mp3'),
    }

    const addtoPlayerList = (player:string) => {
        setPlayerList(prev =>
            prev.includes(player) ? prev : [...prev, player]
        );      
    };

    const playName = (key: keyof typeof audioPlayers) => {
        audioPlayers[key].play();
    };

    return(
        <View style= {styles.container}>
            <View>  
                <Text style={styles.playSelectTitle}>Players Selected: </Text>
            </View>
            <View style={styles.buttonGrid}>
                <TouchableOpacity 
                    style={playerSelected ? styles.playerSelected : styles.playerBtn}
                    onPress={() => {
                        addtoPlayerList("Amaya");
                        playName('amaya');
                    }}
                >
                    <Text style={styles.playerText}>Amaya</Text>
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
    playerSelected: {
        backgroundColor:"#9c03f5ff", 
        alignItems:'center', 
        borderRadius: 15,      
    },
    playerBtn:{
        backgroundColor:"#ca67f1ff",
        alignItems:'center',
    },
    playerText:{
        color:"#faeeeeff"
    },
});
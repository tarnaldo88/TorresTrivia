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
    FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDynamicSound } from '../services/UseDynamicSound';


export const PlayerSelectScreen: React.FC = () =>  {    
    const {play} = useDynamicSound();
    const [playerList, setPlayerList] = useState<string[]>([]);
    const [meganSelected, setMeganSelected] = useState<boolean>(false);
    const [emilioSelected, setEmilioSelected] = useState<boolean>(false);
    const [kaiSelected, setKaiSelected] = useState<boolean>(false);
    const [amayaSelected, setAmayaSelected] = useState<boolean>(false);

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
        play(audioPlayers[key]);
    };

    return(
        <View style= {styles.container}>
            <View style={styles.playerSelectedContainer}>  
                <Text style={styles.playSelectTitle}>Players Selected: </Text>
                <FlatList
                    data={playerList}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <Text style={styles.playerSelectedText}>{item}</Text>
                    )}
                    style={styles.flatListContain}
                />
            </View>
            <View style={styles.buttonGrid}>
                <TouchableOpacity 
                    style={amayaSelected ? styles.playerSelected : styles.playerBtn}
                    onPress={() => {
                        addtoPlayerList("Amaya");
                        playName('amaya');
                        setAmayaSelected(!amayaSelected);
                    }}
                >
                    <Text style={styles.playerText}>Amaya</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={kaiSelected ? styles.playerSelected : styles.playerBtn}
                    onPress={() => {
                        addtoPlayerList("Kai");
                        playName('kai');
                        setKaiSelected(!kaiSelected);
                    }}
                >
                    <Text style={styles.playerText}>Kai</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={meganSelected ? styles.playerSelected : styles.playerBtn}
                    onPress={() => {
                        addtoPlayerList("Megan");
                        playName('megan');
                        setMeganSelected(!meganSelected);
                    }}
                >
                    <Text style={styles.playerText}>Megan</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={emilioSelected ? styles.playerSelected : styles.playerBtn}
                    onPress={() => {
                        addtoPlayerList("Emilio");
                        playName('emilio');
                        setEmilioSelected(!emilioSelected);
                    }}
                >
                    <Text style={styles.playerText}>Emilio</Text>
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
        margin:10,
        marginTop:'20%',
        // flexDirection:'row',
    },
    flatListContain:{
        flexDirection:'row', 
    },
    playSelectTitle: {
        fontSize: 20,
        color: "#01fff2ff",
        marginBottom:10,
    },
    playerSelectedText:{
        color:"#01fff2ff",
        fontSize: 18,        
    },
    buttonGrid:{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        paddingHorizontal: 10,
    },
    playerSelected: {
        width: "30%",               // Three per row
        aspectRatio: 1.8, 
        backgroundColor:"#9c03f5ff", 
        alignItems:'center', 
        borderRadius: 15,    
        marginVertical: 8,
        justifyContent: "center",  
    },
    playerBtn:{
        width: "30%",               // Three per row
        aspectRatio: 1.8, 
        backgroundColor:"#c50303ff",
        alignItems:'center',
        marginVertical: 8,
        justifyContent: "center",
    },
    playerText:{
        color:"#faeeeeff",
        fontSize:20,
    },
});
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const PlayerSelectScreen: React.FC = () =>  {
    const navigation = useNavigation<HomeScreenNavigationProp>();    
    const {play} = useDynamicSound();
    const [playerList, setPlayerList] = useState<string[]>([]);
    const [meganSelected, setMeganSelected] = useState<boolean>(false);
    const [emilioSelected, setEmilioSelected] = useState<boolean>(false);
    const [kaiSelected, setKaiSelected] = useState<boolean>(false);
    const [amayaSelected, setAmayaSelected] = useState<boolean>(false);
    const [modeSelect, setModeSelect] = useState<boolean>(true);
    // const [playerOrTeamModeSelected, setPlayerOrTeamModeSelected] = useState<boolean>(true);

    const audioPlayers = {
        megan: require('../assets/audio/this/thisisMegan.mp3'),
        emilio: require('../assets/audio/this/thisisEmilio.mp3'),
        amaya: require('../assets/audio/this/thisisAmaya.mp3'),
        kai: require('../assets/audio/this/thisisKai.mp3'),
        nathan: require('../assets/audio/this/thisisKai.mp3'), //placeholder audio file until upload
        julian: require('../assets/audio/this/thisisKai.mp3'), //placeholder audio file until upload
    }

    const teamPlayers = {

    }

    const addtoPlayerList = (player:string) => {
        setPlayerList(prev =>
            prev.includes(player)
                ? prev.filter(p => p !== player)   // remove
                : [...prev, player]   
        );      
    };

    const switchSelectModes = () => {
        setModeSelect(!modeSelect);
    }

    const playName = (key: keyof typeof audioPlayers) => {
        play(audioPlayers[key]);
    };

    const playTeamName = (key: keyof typeof teamPlayers) => {
        //play(teamPlayers[key]);
    };

    const playerSelect = () => {
        return(
            <View style= {styles.container}>
            <View style={styles.playerSelectedContainer}>        
                <View style={styles.backBtn}>
                <TouchableOpacity style={styles.playerSelected} onPress={() => {navigation.navigate('Home')}}>
                    <Text style={styles.playerText}> ⬅️ Back</Text>
                </TouchableOpacity>
            </View>          
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
        );
    }

    const teamSelect = () => {
        return(
            <View>
                <Text style={styles.playerText}>Under Construction</Text>
            </View>
        );
    }

    return(
        <ImageBackground 
            source={require('../assets/playSel.png')} 
            resizeMode='cover' 
            style={styles.background}
        >
        <View style={styles.modeSelectStyle}>
            <TouchableOpacity onPress={switchSelectModes} style={modeSelect ? styles.playerSelected : styles.playerBtn}>
                <Text>Player Select</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={switchSelectModes} style={modeSelect ? styles.playerBtn : styles.playerSelected}>
                <Text>Team Select</Text>
            </TouchableOpacity>
        </View>
        {modeSelect ?  playerSelect : teamSelect}
        </ImageBackground>
    )
};

const styles = StyleSheet.create({
    modeSelectStyle:{
        flexDirection:'row',
    },
    container: {
        flex: 1,
        alignItems: "center",
        paddingTop: 40,
    },
    background: {
        flex: 1,        
        width: "100%",
        height: "100%",
    },
    playerSelectedContainer:{
        margin:10,
        alignItems: 'center',
        // flexDirection:'row',
    },
    flatListContain:{
        flexDirection:'row', 
    },
    playSelectTitle: {
        fontSize: 20,
        color: "#ddf8f7ff",
        marginBottom:10,
    },
    playerSelectedText:{
        color:"#e5fcfbff",
        fontSize: 18,        
    },
    buttonGrid:{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        // paddingHorizontal: 10,
        width:'90%',
    },
    playerSelected: {
        width: "30%",               // Three per row
        aspectRatio: 1.8, 
        backgroundColor:"#9c03f5ff", 
        alignItems:'center', 
        borderRadius: 15,    
        marginVertical: 8,
        // justifyContent: "center",  
    },
    playerBtn:{
        width: "30%",               // Three per row
        aspectRatio: 1.8, 
        backgroundColor:"#03c54dff",
        alignItems:'center',
        justifyContent: "center",
        marginVertical: 8,        
    },
    playerText:{
        color:"#faeeeeff",
        fontSize:20,
    },
    backBtn:{
        width:'30%',
        alignItems: 'flex-start',
    },
});
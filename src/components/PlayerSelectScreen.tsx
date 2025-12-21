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
    TextInput,
    Pressable,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDynamicSound } from '../services/UseDynamicSound';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type RadioButtonProps = {
    selected: boolean;
    onPress: () => void;
    label: string;
  };

export const PlayerSelectScreen: React.FC = () =>  {
    const navigation = useNavigation<HomeScreenNavigationProp>();    
    const {play} = useDynamicSound();
    const [playerList, setPlayerList] = useState<string[]>([]);
    const [meganSelected, setMeganSelected] = useState<boolean>(false);
    const [emilioSelected, setEmilioSelected] = useState<boolean>(false);
    const [kaiSelected, setKaiSelected] = useState<boolean>(false);
    const [amayaSelected, setAmayaSelected] = useState<boolean>(false);
    const [modeSelect, setModeSelect] = useState<boolean>(true);
    const [shazamSelected,setShazamSelected] = useState<boolean>(false);
    const [teamCustOne, setTeamCustOne] = useState<string>("Custom Team 1");
    const [teamCustTwo, setTeamCustTwo] = useState<string>("Custom Team 2");
    const [teamCustThree, setTeamCustThree] = useState<string>("Custom Team 3");
    const [teamList, setTeamList] = useState<string[]>([]);
    const [shazList, setShazList] = useState<string[]>([]);
    const [custOneList, setCustOneList] = useState<string[]>([]);
    const [custTwoList, setCustTwoList] = useState<string[]>([]);
    const [custThreeList, setCustThreeList] = useState<string[]>([]);
    //for knowing which team is in selection mode
    const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
    // const [teams, setTeams] = useState<string[][]>([
    //     [], [], [], []
    //   ]);

    const teamNames = ["Shazam", teamCustOne, teamCustTwo, teamCustThree];

    const audioTeams = {
        shazam: require('../assets/audio/this/thisisMegan.mp3');
        custOne: require('../assets/audio/this/thisisMegan.mp3');
        custTwo: require('../assets/audio/this/thisisMegan.mp3');
        custThree: require('../assets/audio/this/thisisMegan.mp3');
    };

    const audioPlayers = {
        megan: require('../assets/audio/this/thisisMegan.mp3'),
        emilio: require('../assets/audio/this/thisisEmilio.mp3'),
        amaya: require('../assets/audio/this/thisisAmaya.mp3'),
        kai: require('../assets/audio/this/thisisKai.mp3'),
        nathan: require('../assets/audio/this/thisisKai.mp3'), //placeholder audio file until upload
        julian: require('../assets/audio/this/thisisKai.mp3'), //placeholder audio file until upload
        marta: require('../assets/audio/this/thisisKai.mp3'), 
        amy: require('../assets/audio/this/thisisKai.mp3'), 
        pat: require('../assets/audio/this/thisisKai.mp3'), 
        hosmel: require('../assets/audio/this/thisisKai.mp3'), 
        hosmelito: require('../assets/audio/this/thisisKai.mp3'), 
        linda: require('../assets/audio/this/thisisKai.mp3'), 
        arnaldo: require('../assets/audio/this/thisisKai.mp3'), 
        brad: require('../assets/audio/this/thisisKai.mp3'), 
        lindsey: require('../assets/audio/this/thisisKai.mp3'), 
        brian: require('../assets/audio/this/thisisKai.mp3'), 
        everett: require('../assets/audio/this/thisisKai.mp3'), 
    }

    type PlayerName = keyof typeof audioPlayers;
    const playas = Object.keys(audioPlayers) as PlayerName[];

    const [teamMembers, setTeamMembers] = useState<PlayerName[][]>([
        [],
        [],
        [],
        [],
      ]);

    //another possibility is to have teams and when you press team button modal pops up with all the players 
    //same as the player flatlist that plays their sound clip on press & adds that player to team

    const teamPlayers = {

    }

    //next step is to have text input that assigns to custom team 1-3, use that text to populate buttons

    const addtoPlayerList = (player:string) => {
        setPlayerList(prev =>
            prev.includes(player)
                ? prev.filter(p => p !== player)   // remove
                : [...prev, player]   
        );      
    };

    const addTeamToList = (team: string) => {
        setTeamList(prev => 
            // [...prev, team]
            prev.includes(team)
                ? prev.filter(p => p !== team)
                : [...prev, team]
        );
    }

    const switchSelectModes = () => {
        setModeSelect(!modeSelect);
    }

    const playName = (key: keyof typeof audioPlayers) => {
        play(audioPlayers[key]);
    };

    const playTeamName = (key: keyof typeof teamPlayers) => {
        //play(teamPlayers[key]);
    };

    const addPlayerToTeam = (player: PlayerName) => {
        if (selectedTeam === null) return;
      
        setTeamMembers(prev =>
          prev.map((members, index) =>
            index === selectedTeam
              ? members.includes(player)
                ? members // prevent duplicates (optional)
                : [...members, player]
              : members
          )
        );
      };

    

    const RadioButton = ({ selected, onPress, label }: RadioButtonProps) => (
        <Pressable
          onPress={onPress}
          style={{ flexDirection: "row", alignItems: "center", marginVertical: 8 }}
        >
          <View
            style={{
              height: 20,
              width: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: "#333",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            {selected && (
              <View
                style={{
                  height: 10,
                  width: 10,
                  borderRadius: 5,
                  backgroundColor: "#333",
                }}
              />
            )}
          </View>
          <Text>{label}</Text>
        </Pressable>
      );

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
            {playas.map(name => (
                <Pressable
                    key={name}
                    onPress={() => {
                        addtoPlayerList(name);
                        playName(name);
                    }}
                    style={{ padding: 12 }}
                >
                    <Text>{name}</Text>
                </Pressable>
            ))}
            </View>            
        </View>
        );
    }

    const teamSelect = () => {
        return(
            <View>
                <View style={styles.playerSelectedContainer}>        
                <View style={styles.backBtn}>
                    <TouchableOpacity style={styles.playerSelected} onPress={() => {navigation.navigate('Home')}}>
                        <Text style={styles.playerText}> ⬅️ Back</Text>
                    </TouchableOpacity>
                </View>          
                <Text style={styles.custTeamNameTitle}>Customize Team Names: </Text>
                <TextInput 
                    value={teamCustOne}
                    onChangeText = {text => {setTeamCustOne(text)}}
                    style={styles.textInput}
                />
                <TextInput 
                    value={teamCustTwo}
                    onChangeText = {text => {setTeamCustTwo(text)}}
                    style={styles.textInput}
                />
                <TextInput 
                    value={teamCustThree}
                    onChangeText = {text => {setTeamCustThree(text)}}
                    style={styles.textInput}
                />
            </View>
            <View>
                <TouchableOpacity onPress={() => addTeamToList("Shazam")}>
                    <Text>Team Shazam</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {addTeamToList(teamCustOne)}}>
                    <Text style={styles.playerText}>{teamCustOne}</Text>
                </TouchableOpacity >
                <TouchableOpacity onPress={() => {addTeamToList(teamCustTwo)}}>
                    <Text style={styles.playerText}>{teamCustTwo}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {addTeamToList(teamCustThree)}}>
                    <Text style={styles.playerText}>{teamCustThree}</Text>
                </TouchableOpacity>
            </View>
            <View>
                <Text>Select which team to starting drafting to:</Text>
            </View>
            <View>
                <Text style={styles.playSelectTitle}>Select which team to add Players for the team: </Text>
                {teamNames.map((team, index) => (
                    <RadioButton
                        key={team}
                        label={team}
                        selected={selectedTeam === index}
                        onPress={() => setSelectedTeam(index)}
                    />
                ))}
            </View>
            <View>
                {/* Player buttons  */}
                {playas.map(player => (
                    <Pressable
                        key={player}
                        onPress={() => addPlayerToTeam(player)}
                    >
                        <Text>{player}</Text>
                    </Pressable>
                ))}
            </View>
            </View>
        );
    }

    return(
        <ImageBackground 
            source={require('../assets/playSel.png')} 
            resizeMode='cover' 
            style={styles.background}
        >
            <View style={styles.backBtn}>
                    <TouchableOpacity style={styles.playerSelected} onPress={() => {navigation.navigate('Home')}}>
                        <Text style={styles.playerText}> ⬅️ Back</Text>
                    </TouchableOpacity>
            </View>  
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
    textInput: {
        padding: 10,
        borderColor: '#000',
        borderWidth: 1,
        margin: 12,
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
    custTeamNameTitle:{
        color:"#faeeeeff",
        fontSize:20,
    },
    backBtn:{
        width:'30%',
        alignItems: 'flex-start',
    },
});
import { useState, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    FlatList,
    TextInput,
    Pressable,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDynamicSound } from '../services/UseDynamicSound';
import { RootStackParamList } from '../navigation/MainNavigator';

type PlayerSelectNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerSelect'>;

type RadioButtonProps = {
    selected: boolean;
    onPress: () => void;
    label: string;
};

export const PlayerSelectScreen: React.FC = () => {
    const navigation = useNavigation<PlayerSelectNavigationProp>();    
    const { play } = useDynamicSound();
    const [playerList, setPlayerList] = useState<string[]>([]);
    const [modeSelect, setModeSelect] = useState<boolean>(true);
    const [teamCustOne, setTeamCustOne] = useState<string>("Custom Team 1");
    const [teamCustTwo, setTeamCustTwo] = useState<string>("Custom Team 2");
    const [teamCustThree, setTeamCustThree] = useState<string>("Custom Team 3");
    const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

    // Use refs to avoid re-renders while typing
    const teamOneRef = useRef(teamCustOne);
    const teamTwoRef = useRef(teamCustTwo);
    const teamThreeRef = useRef(teamCustThree);

    const teamNames = ["Shazam", teamCustOne, teamCustTwo, teamCustThree];

    const audioPlayers = {
        megan: require('../assets/audio/this/thisisMegan.mp3'),
        emilio: require('../assets/audio/this/thisisEmilio.mp3'),
        amaya: require('../assets/audio/this/thisisAmaya.mp3'),
        kai: require('../assets/audio/this/thisisKai.mp3'),
        nathan: require('../assets/audio/this/thisisKai.mp3'),
        julian: require('../assets/audio/this/thisisKai.mp3'),
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
    };

    type PlayerName = keyof typeof audioPlayers;
    const playas = Object.keys(audioPlayers) as PlayerName[];

    const addtoPlayerList = (player: string) => {
        setPlayerList(prev =>
            prev.includes(player)
                ? prev.filter(p => p !== player)
                : [...prev, player]   
        );      
    };

    const addTeamToList = (team: string) => {
        setPlayerList(prev =>
            prev.includes(team)
                ? prev.filter(t => t !== team)
                : [...prev, team]   
        );      
    };

    const switchSelectModes = () => {
        setModeSelect(!modeSelect);
    };

    const playName = (key: keyof typeof audioPlayers) => {
        play(audioPlayers[key]);
    };

    const RadioButton = ({ selected, onPress, label }: RadioButtonProps) => (
        <Pressable
            onPress={onPress}
            style={styles.radioButtonContainer}
        >
            <View style={[styles.radioButtonCircle, selected && styles.radioButtonSelected]}>
                {selected && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioButtonLabel}>{label}</Text>
        </Pressable>
    );

    const PlayerSelectView = () => {
        return (
            <View style={styles.modeContainer}>
                <View style={styles.selectedListContainer}>
                    <Text style={styles.sectionTitle}>Selected Players</Text>
                    {playerList.length === 0 ? (
                        <Text style={styles.emptyText}>No players selected</Text>
                    ) : (
                        <FlatList
                            data={playerList}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <View style={styles.selectedPlayerTag}>
                                    <Text style={styles.selectedPlayerText}>{item}</Text>
                                </View>
                            )}
                            scrollEnabled={false}
                        />
                    )}
                </View>

                <View style={styles.playersGridContainer}>
                    <Text style={styles.sectionTitle}>Available Players</Text>
                    <View style={styles.playerGrid}>
                        {playas.map(name => (
                            <Pressable
                                key={name}
                                onPress={() => {
                                    addtoPlayerList(name);
                                    playName(name);
                                }}
                                style={[
                                    styles.playerButton,
                                    playerList.includes(name) && styles.playerButtonSelected
                                ]}
                            >
                                <Text style={styles.playerButtonText}>{name}</Text>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    const TeamSelectView = () => {
        return (
            <FlatList
                data={[{ id: 'content' }]}
                keyExtractor={(item) => item.id}
                renderItem={() => (
                    <View>
                        <View style={styles.customizeTeamsContainer}>
                            <Text style={styles.sectionTitle}>Customize Team Names</Text>
                            <TextInput 
                                defaultValue={teamCustOne}
                                onChangeText={text => {
                                    teamOneRef.current = text;
                                }}
                                onBlur={() => setTeamCustOne(teamOneRef.current)}
                                style={styles.teamNameInput}
                                placeholder="Team 1 Name"
                                placeholderTextColor="#999"
                            />
                            <TextInput 
                                defaultValue={teamCustTwo}
                                onChangeText={text => {
                                    teamTwoRef.current = text;
                                }}
                                onBlur={() => setTeamCustTwo(teamTwoRef.current)}
                                style={styles.teamNameInput}
                                placeholder="Team 2 Name"
                                placeholderTextColor="#999"
                            />
                            <TextInput 
                                defaultValue={teamCustThree}
                                onChangeText={text => {
                                    teamThreeRef.current = text;
                                }}
                                onBlur={() => setTeamCustThree(teamThreeRef.current)}
                                style={styles.teamNameInput}
                                placeholder="Team 3 Name"
                                placeholderTextColor="#999"
                            />
                        </View>                

                        <View style={styles.teamButtonsContainer}>
                            <Text style={styles.sectionTitle}>Select Teams to Play</Text>
                            {teamNames.map(team => (
                                <Pressable
                                    key={team}
                                    onPress={() => addTeamToList(team)}
                                    style={[
                                        styles.teamButton,
                                        playerList.includes(team) && styles.teamButtonSelected
                                    ]}
                                >
                                    <Text style={[styles.teamButtonText, playerList.includes(team) && { color: '#fff' }]}>
                                        {team}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={styles.selectedListContainer}>
                            <Text style={styles.sectionTitle}>Selected Teams</Text>
                            {playerList.length === 0 ? (
                                <Text style={styles.emptyText}>No teams selected</Text>
                            ) : (
                                playerList.map(team => (
                                    <View key={team} style={styles.selectedTeamTag}>
                                        <Text style={styles.selectedTeamText}>{team}</Text>
                                    </View>
                                ))
                            )}
                        </View>

                        <View style={styles.draftingContainer}>
                            <Text style={styles.sectionTitle}>Draft Players to Team</Text>
                            <Text style={styles.draftingSubtitle}>Select which team to draft to:</Text>
                            {teamNames.map((team, index) => (
                                <RadioButton
                                    key={team}
                                    label={team}
                                    selected={selectedTeam === index}
                                    onPress={() => setSelectedTeam(index)}
                                />
                            ))}
                        </View>

                        <View style={styles.playersGridContainer}>
                            <Text style={styles.sectionTitle}>Available Players</Text>
                            <View style={styles.playerGrid}>
                                {playas.map(player => (
                                    <Pressable
                                        key={player}
                                        onPress={() => {
                                            playName(player);
                                        }}
                                        style={styles.playerButton}
                                    >
                                        <Text style={styles.playerButtonText}>{player}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </View>
                )}
                style={styles.modeContainer}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        );
    };

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Player Selection</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.modeToggle}>
                <TouchableOpacity 
                    onPress={switchSelectModes} 
                    style={[styles.modeButton, modeSelect && styles.modeButtonActive]}
                >
                    <Text style={[styles.modeButtonText, modeSelect && styles.modeButtonTextActive]}>
                        Players
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={switchSelectModes} 
                    style={[styles.modeButton, !modeSelect && styles.modeButtonActive]}
                >
                    <Text style={[styles.modeButtonText, !modeSelect && styles.modeButtonTextActive]}>
                        Teams
                    </Text>
                </TouchableOpacity>
            </View>

            {modeSelect ? <PlayerSelectView /> : <TeamSelectView />}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1a1a1a',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    backButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    modeToggle: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: '#007AFF',
    },
    modeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    modeButtonTextActive: {
        color: '#fff',
    },
    modeContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12,
        marginTop: 16,
    },
    selectedListContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedPlayerTag: {
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    selectedPlayerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    selectedTeamTag: {
        backgroundColor: '#f3e5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#9c27b0',
    },
    selectedTeamText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
    playersGridContainer: {
        marginBottom: 16,
    },
    playerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    playerButton: {
        width: '31%',
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playerButtonSelected: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    playerButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
        textAlign: 'center',
    },
    customizeTeamsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    teamNameInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        fontSize: 14,
        backgroundColor: '#e0f17cff',
        color:"#3a3a3aff",
        borderBottomColor:'rgba(3, 199, 29, 0.8)',
        fontWeight:'bold',
    },
    teamButtonsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    teamButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    teamButtonSelected: {
        backgroundColor: '#9c27b0',
        borderColor: '#9c27b0',
    },
    teamButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    draftingContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    draftingSubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
        fontWeight: '500',
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    radioButtonCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioButtonSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#e3f2fd',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#007AFF',
    },
    radioButtonLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
});
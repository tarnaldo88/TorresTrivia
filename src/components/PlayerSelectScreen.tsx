import { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Pressable,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDynamicSound } from '../services/UseDynamicSound';
import { useTeams } from '../context/TeamContext';
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
    const { setSelectedTeams } = useTeams();
    const [playerList, setPlayerList] = useState<string[]>([]);
    const [modeSelect, setModeSelect] = useState<boolean>(true);
    const [teamCustOne, setTeamCustOne] = useState<string>('Custom Team 1');
    const [teamCustTwo, setTeamCustTwo] = useState<string>('Custom Team 2');
    const [teamCustThree, setTeamCustThree] = useState<string>('Custom Team 3');
    const [selectedTeam, setSelectedTeam] = useState<number | null>(null);

    const teamOneRef = useRef(teamCustOne);
    const teamTwoRef = useRef(teamCustTwo);
    const teamThreeRef = useRef(teamCustThree);

    const teamNames = ['Shazam', teamCustOne, teamCustTwo, teamCustThree];

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
        setPlayerList((prev) => (prev.includes(player) ? prev.filter((p) => p !== player) : [...prev, player]));
    };

    const addTeamToList = (team: string) => {
        setPlayerList((prev) => (prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]));
    };

    const switchSelectModes = () => {
        setModeSelect(!modeSelect);
    };

    const playName = (key: keyof typeof audioPlayers) => {
        play(audioPlayers[key]);
    };

    const RadioButton = ({ selected, onPress, label }: RadioButtonProps) => (
        <Pressable onPress={onPress} style={styles.radioButtonContainer}>
            <View style={[styles.radioButtonCircle, selected && styles.radioButtonSelected]}>
                {selected && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.radioButtonLabel}>{label}</Text>
        </Pressable>
    );

    const PlayerSelectView = () => {
        return (
            <View style={styles.modeContainer}>
                <View style={styles.card}>
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

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Available Players</Text>
                    <View style={styles.playerGrid}>
                        {playas.map((name) => (
                            <Pressable
                                key={name}
                                onPress={() => {
                                    addtoPlayerList(name);
                                    playName(name);
                                }}
                                style={[
                                    styles.playerButton,
                                    playerList.includes(name) && styles.playerButtonSelected,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.playerButtonText,
                                        playerList.includes(name) && styles.playerButtonTextSelected,
                                    ]}
                                >
                                    {name}
                                </Text>
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
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Customize Team Names</Text>
                            <TextInput
                                defaultValue={teamCustOne}
                                onChangeText={(text) => {
                                    teamOneRef.current = text;
                                }}
                                onBlur={() => setTeamCustOne(teamOneRef.current)}
                                style={styles.teamNameInput}
                                placeholder="Team 1 Name"
                                placeholderTextColor="#94a3b8"
                            />
                            <TextInput
                                defaultValue={teamCustTwo}
                                onChangeText={(text) => {
                                    teamTwoRef.current = text;
                                }}
                                onBlur={() => setTeamCustTwo(teamTwoRef.current)}
                                style={styles.teamNameInput}
                                placeholder="Team 2 Name"
                                placeholderTextColor="#94a3b8"
                            />
                            <TextInput
                                defaultValue={teamCustThree}
                                onChangeText={(text) => {
                                    teamThreeRef.current = text;
                                }}
                                onBlur={() => setTeamCustThree(teamThreeRef.current)}
                                style={styles.teamNameInput}
                                placeholder="Team 3 Name"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Select Teams to Play</Text>
                            {teamNames.map((team) => (
                                <Pressable
                                    key={team}
                                    onPress={() => addTeamToList(team)}
                                    style={[
                                        styles.teamButton,
                                        playerList.includes(team) && styles.teamButtonSelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.teamButtonText,
                                            playerList.includes(team) && styles.teamButtonTextSelected,
                                        ]}
                                    >
                                        {team}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Selected Teams</Text>
                            {playerList.length === 0 ? (
                                <Text style={styles.emptyText}>No teams selected</Text>
                            ) : (
                                playerList.map((team) => (
                                    <View key={team} style={styles.selectedTeamTag}>
                                        <Text style={styles.selectedTeamText}>{team}</Text>
                                    </View>
                                ))
                            )}
                        </View>

                        <View style={styles.card}>
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

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Available Players</Text>
                            <View style={styles.playerGrid}>
                                {playas.map((player) => (
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
        <SafeAreaView style={styles.screen}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            if (!modeSelect) {
                                setSelectedTeams(playerList);
                            }
                            navigation.navigate('Home');
                        }}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Player Selection</Text>
                    <View style={styles.headerSpacer} />
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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    keyboardContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 18,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#f8fafc',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 60,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 999,
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    backButtonText: {
        color: '#f8fafc',
        fontSize: 14,
        fontWeight: '700',
    },
    modeToggle: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    modeButtonActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    modeButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#cbd5e1',
    },
    modeButtonTextActive: {
        color: '#fff',
    },
    modeContainer: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#020617',
        shadowOpacity: 0.14,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 12,
    },
    selectedPlayerTag: {
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb',
    },
    selectedPlayerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    selectedTeamTag: {
        backgroundColor: '#dbeafe',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb',
    },
    selectedTeamText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    emptyText: {
        fontSize: 14,
        color: '#64748b',
        fontStyle: 'italic',
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
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playerButtonSelected: {
        backgroundColor: '#dbeafe',
        borderColor: '#2563eb',
    },
    playerButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1e293b',
        textAlign: 'center',
    },
    playerButtonTextSelected: {
        color: '#1d4ed8',
    },
    teamNameInput: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        fontSize: 14,
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontWeight: '600',
    },
    teamButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    teamButtonSelected: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    teamButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    teamButtonTextSelected: {
        color: '#fff',
    },
    draftingSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 12,
        fontWeight: '500',
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 8,
        backgroundColor: '#f8fafc',
        borderRadius: 10,
    },
    radioButtonCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2563eb',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioButtonSelected: {
        borderColor: '#2563eb',
        backgroundColor: '#dbeafe',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2563eb',
    },
    radioButtonLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
});

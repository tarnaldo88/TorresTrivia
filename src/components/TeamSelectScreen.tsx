import { useState } from 'react';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/MainNavigator';

type TeamSelectNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TeamSelect'>;

export const TeamSelectScreen: React.FC = () => {
  const navigation = useNavigation<TeamSelectNavigationProp>();
  const [teamList, setTeamList] = useState<string[]>([]);
  const [team1Selected, setTeam1Selected] = useState<boolean>(false);
  const [team2Selected, setTeam2Selected] = useState<boolean>(false);
  const [team3Selected, setTeam3Selected] = useState<boolean>(false);
  const [team4Selected, setTeam4Selected] = useState<boolean>(false);

  const teams = ['Team 1', 'Team 2', 'Team 3', 'Team 4'];

  const addToTeamList = (team: string) => {
    setTeamList((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    );
  };

  const handleTeamPress = (team: string, isSelected: boolean, setSelected: (value: boolean) => void) => {
    addToTeamList(team);
    setSelected(!isSelected);
  };

  return (
    <ImageBackground
      source={require('../assets/torresTrivia.png')}
      resizeMode="cover"
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.teamSelectedContainer}>
          <View style={styles.backBtn}>
            <TouchableOpacity
              style={styles.teamSelected}
              onPress={() => {
                navigation.navigate('Home');
              }}
            >
              <Text style={styles.teamText}>⬅️ Back</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.teamSelectTitle}>Teams Selected:</Text>
          <FlatList
            data={teamList}
            keyExtractor={(item) => item}
            renderItem={({ item }) => <Text style={styles.teamSelectedText}>{item}</Text>}
            style={styles.flatListContain}
          />
        </View>
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={team1Selected ? styles.teamSelected : styles.teamBtn}
            onPress={() => handleTeamPress('Team 1', team1Selected, setTeam1Selected)}
          >
            <Text style={styles.teamText}>Team 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={team2Selected ? styles.teamSelected : styles.teamBtn}
            onPress={() => handleTeamPress('Team 2', team2Selected, setTeam2Selected)}
          >
            <Text style={styles.teamText}>Team 2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={team3Selected ? styles.teamSelected : styles.teamBtn}
            onPress={() => handleTeamPress('Team 3', team3Selected, setTeam3Selected)}
          >
            <Text style={styles.teamText}>Team 3</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={team4Selected ? styles.teamSelected : styles.teamBtn}
            onPress={() => handleTeamPress('Team 4', team4Selected, setTeam4Selected)}
          >
            <Text style={styles.teamText}>Team 4</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  teamSelectedContainer: {
    margin: 10,
    alignItems: 'center',
  },
  flatListContain: {
    flexDirection: 'row',
  },
  teamSelectTitle: {
    fontSize: 20,
    color: '#ddf8f7ff',
    marginBottom: 10,
  },
  teamSelectedText: {
    color: '#e5fcfbff',
    fontSize: 18,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '90%',
  },
  teamSelected: {
    width: '30%',
    aspectRatio: 1.8,
    backgroundColor: '#9c03f5ff',
    alignItems: 'center',
    borderRadius: 15,
    marginVertical: 8,
    justifyContent: 'center',
  },
  teamBtn: {
    width: '30%',
    aspectRatio: 1.8,
    backgroundColor: '#03c54dff',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  teamText: {
    color: '#faeeeeff',
    fontSize: 20,
  },
  backBtn: {
    width: '30%',
    alignItems: 'flex-start',
  },
});

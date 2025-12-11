import {useState} from 'react';  
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

    const addtoPlayerList = (player:string) => {
        setPlayerList(prev => [...prev, player]);
    };

    return(
        <View>
            
        </View>
    )
};

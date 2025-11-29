import React, { useState, useEffect } from 'react';  
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image,
    ImageBackground, 
} from 'react-native';
import { ScoreManager } from '../services/scoreManager';

interface TriviaScreenProps {
    roundDuration?: number;
    onRoundEnd?: (finalScore: number) => void;
}

export const TriviaScreen: React.FC<TriviaScreenProps> = ({
    roundDuration = 120,
    onRoundEnd,
}) => {

    return(
        <ImageBackground source={require('../assets/torresTrivia.png')}>
            <View>
                
            </View>
        </ImageBackground>

    );
};
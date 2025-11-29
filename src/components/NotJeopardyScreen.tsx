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

interface NotJeopardyScreenProps {
    roundDuration?: number;
    onRoundEnd?: (finalScore: number) => void;
}

export const NotJeopardyScreen: React.FC<NotJeopardyScreenProps> = ({
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
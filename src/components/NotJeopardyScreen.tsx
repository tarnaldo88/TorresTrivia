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
    const [pl1, setpl1] = useState(0);
    const [pl2, setpl2] = useState(0);
    const [pl3, setpl3] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
          onRoundEnd && onRoundEnd(pl1 + pl2 + pl3);
        }, roundDuration * 1000);
    
        return () => clearTimeout(timer);
      }, [pl1, pl2, pl3, onRoundEnd, roundDuration]);

    

    return(
        <ImageBackground source={require('../assets/torresTrivia.png')}>
            <View>
                
            </View>
        </ImageBackground>

    );
};
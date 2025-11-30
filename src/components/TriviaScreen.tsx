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
    const [showAnswer,setShowAnswer] = useState(false);


    const toggleAnswer = () => {
        setShowAnswer(!showAnswer);
    };

    return(
        <ImageBackground source={require('../assets/torresTrivia.png')}>
            <View>
                <View>
                    <Text>Question:</Text>
                </View>
                <View>
                    <TouchableOpacity>                        
                        <Text>Show Answer</Text>
                    </TouchableOpacity>
                    <View>
                        (showAnswer) ? 
                            <Text> Answer</Text> 
                        :
                            
                    </View>
                </View>
            </View>
        </ImageBackground>

    );
};
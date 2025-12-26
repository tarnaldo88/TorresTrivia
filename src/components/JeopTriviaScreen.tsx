import React, { useState, useEffect } from 'react';  
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ImageBackground,
    ActivityIndicator,
} from 'react-native';
import { TriviaDatabase } from '../services/triviaDatabase';
import { TriviaQuestion } from '../types/index';

interface JeopTriviaScreenProps {
    roundDuration?: number;
    onRoundENd?: (finalScore: number) => void;
}

export const JeopTriviaScreen: React.FC<JeopTriviaScreenProps> = () => {
    const [showAnswer, setShowAnswer] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [triviaDb, setTriviaDb] = useState<TriviaDatabase | null>(null);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);


    return(
        <View>
            <Text>in progress</Text>
        </View>
    );
}

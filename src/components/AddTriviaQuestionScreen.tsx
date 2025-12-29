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

export const AddTriviaQuestionScreen = () => {
    const [triviaDb, setTriviaDb] = useState<TriviaDatabase | null>(null);
    const [loading, setLoading] = useState(true);
    const [difficulty, setDifficulty] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');

    const initializeTriviaDatabase = async () => {
        try {
            const db = new TriviaDatabase();
            await db.initialize();
            setTriviaDb(db);
            setLoading(false);
        } catch (error) {
            console.error('Failed to initialize trivia database:', error);
            setLoading(false);
        }
    };


    return (
    <View style={styles.container}>
        <Text style={styles.title}>Add Trivia Question</Text>
    </View>
);
};
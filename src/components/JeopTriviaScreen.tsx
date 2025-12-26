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
    const [totalScore, setTotalScore] = useState(0);

    useEffect(() => {
        initializeTriviaDatabase();
    }, []);

    const initializeTriviaDatabase = async () => {
        try {
            const db = new TriviaDatabase();
            await db.initialize();
            setTriviaDb(db);
            
            // Load first question
            const firstQuestion = await db.getRandomQuestion();
            setCurrentQuestion(firstQuestion);
            setLoading(false);
        } catch (error) {
            console.error('Failed to initialize trivia database:', error);
            setLoading(false);
        }
    }

    const nextQuestion = async () => {
        if (!triviaDb) return;

        try{
            setShowAnswer(false);
            const nextQ = await triviaDb.getRandomQuestion();
            setCurrentQuestion(nextQ);
            setQuestionsAnswered(questionsAnswered + 1);
        } catch (error) {
            console.error('Failed to load next question:', error);
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }
    
    if (!currentQuestion) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No questions available</Text>
            </View>
        );
    }

    const addScore = () => {
        nextQuestion();
        setTotalScore(totalScore + currentQuestion.value);
    }

    return(
        <View>
            <Text>in progress</Text>
            <View style={styles.rowContainer}>
                <TouchableOpacity style={styles.correctBtn} onPress={() => addScore()}>
                    <Text>CORRECT!</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.wrongBtn} >
                    <Text>WRONG!</Text>
                </TouchableOpacity>
            </View>
            {/* <View style={styles.container}>
                    <TouchableOpacity style={styles.playerBtn} onPress={saveJeopardyHighScore}>
                        <Text>Save High Score</Text>
                    </TouchableOpacity>
            </View> */}
        </View>
    );
}

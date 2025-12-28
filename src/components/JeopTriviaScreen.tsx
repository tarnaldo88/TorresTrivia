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
import { useNavigation } from '@react-navigation/native';
import { ScoreManager } from '../services/scoreManager';

interface JeopTriviaScreenProps {
    roundDuration?: number;
    onRoundENd?: (finalScore: number) => void;
}

export const JeopTriviaScreen: React.FC<JeopTriviaScreenProps> = () => {
    const navigation = useNavigation();
    const [showAnswer, setShowAnswer] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [triviaDb, setTriviaDb] = useState<TriviaDatabase | null>(null);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [totalScore, setTotalScore] = useState(0);

    const dollarAmounts: number[] = [200, 400, 600, 800, 1000];

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

    const subtractScore = () => {
        nextQuestion();
        setTotalScore(totalScore - currentQuestion.value);
    }

    const toggleAnswer = () => {
        setShowAnswer(!showAnswer);
    }

    return(
        <View style={styles.container}>
            <View style={styles.scoreSection}>
                <Text style={styles.scoreText}>Score: {totalScore}</Text>
                <TouchableOpacity onPress={() => {navigation.navigate('Home')}}>
                    <Text style={styles.endRoundText}>End Round</Text>
                </TouchableOpacity>
            </View>
            <Text>in progress</Text>
            <View style={styles.questionSection}>
                <Text style={styles.questionCounter}>Question {questionsAnswered + 1}</Text>
                <Text style={styles.categoryText}>{currentQuestion.category}</Text>
                <Text style={styles.questionText}>{currentQuestion.answer}</Text>
            </View>
            <TouchableOpacity 
                style={styles.button}
                onPress={toggleAnswer}
            >                        
                <Text style={styles.buttonText}>
                    {showAnswer ? 'Hide Answer' : 'Show Answer'}
                </Text>
            </TouchableOpacity>
            {showAnswer && (
                <View style={styles.answerSection}>
                    <Text style={styles.answerLabel}>Answer: </Text>
                    <Text style={styles.answerText}>{currentQuestion.question}</Text>
                </View>
            )}
            <View style={styles.rowContainer}>
                <TouchableOpacity style={styles.correctBtn} onPress={() => addScore()}>
                    <Text>CORRECT!</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.wrongBtn} onPress={() => subtractScore()}>
                    <Text>WRONG!</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.container}>
                    <TouchableOpacity style={styles.playerBtn} onPress={ScoreManager.saveJeopScore}>
                        <Text>Save High Score</Text>
                    </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    headerSection: {
        marginTop: 20,
        alignItems: 'center',
    },
    scoreSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,  
    },
    scoreText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffffff',  
    },
    questionCounter: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fdfdfdff',
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 14,
        color: '#f7f0f0ff',
        fontStyle: 'italic',
    },
    questionSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 30,
        paddingHorizontal: 10,
    },
    questionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffffff',
        textAlign: 'center',
        lineHeight: 32,
    },
    buttonSection: {
        marginBottom: 30,
        gap: 12,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    answerContainer: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        borderRadius: 8,
        marginVertical: 10,
    },
    answerLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    answerText: {
        fontSize: 18,
        color: '#000',
        fontWeight: '500',
    },
    errorText: {
        fontSize: 16,
        color: '#ff0000',
        textAlign: 'center',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    correctBtn: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrongBtn: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    endRoundText: {
        fontSize: 16,
        color: '#007AFF',
    },
});

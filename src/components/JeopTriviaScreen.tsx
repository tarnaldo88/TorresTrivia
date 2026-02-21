import React, { useState, useEffect } from 'react';  
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ActivityIndicator,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TriviaDatabase } from '../services/triviaDatabase';
import { TriviaQuestion } from '../types/index';
import { ScoreManager } from '../services/scoreManager';
import { RootStackParamList } from '../navigation/MainNavigator';

type JeopTriviaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'JeopTriv'>;

interface JeopTriviaScreenProps {
    roundDuration?: number;
    onRoundENd?: (finalScore: number) => void;
}

export const JeopTriviaScreen: React.FC<JeopTriviaScreenProps> = () => {
    const navigation = useNavigation<JeopTriviaNavigationProp>();
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

    const calcMoney = () => {
        if(currentQuestion.difficulty === 'Easy') {
            return 200;
        } else if(currentQuestion.difficulty === 'Medium') {
            return 400;
        } else {
            return 800;
        }
    };

    const questDifficulty = () => {
        if(currentQuestion.difficulty === 'Easy') {
            return '200';
        } else if(currentQuestion.difficulty === 'Medium') {
            return '400';
        } else {
            return '800';
        }
    }

    const addScore = () => {
        nextQuestion();
        if(questionsAnswered > dollarAmounts.length - 1) {
            setQuestionsAnswered(0);
        }
        setTotalScore(totalScore + calcMoney());
    }

    const subtractScore = () => {
        nextQuestion();
        setTotalScore(totalScore - calcMoney());
    }

    const toggleAnswer = () => {
        setShowAnswer(!showAnswer);
    }

    return(
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Home')}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.endRoundButton} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.endRoundText}>End Round</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.scoreSection}>
                    <Text style={styles.scoreLabel}>Total Score</Text>
                    <Text style={styles.scoreText}>${totalScore}</Text>
                </View>

                <View style={styles.questionCard}>
                    <Text style={styles.questionCounter}>Question {questionsAnswered + 1}</Text>
                    <View style={styles.badgeRow}>
                        <Text style={styles.categoryBadge}>{currentQuestion.category}</Text>
                        <Text style={styles.valueBadge}>${questDifficulty()}</Text>
                    </View>
                    <Text style={styles.questionText}>{currentQuestion.answer}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={toggleAnswer}
                >                        
                    <Text style={styles.buttonText}>
                        {showAnswer ? 'Hide Answer' : 'Show Answer'}
                    </Text>
                </TouchableOpacity>
                {showAnswer && (
                    <View style={styles.answerContainer}>
                        <Text style={styles.answerLabel}>Correct Response</Text>
                        <Text style={styles.answerText}>{currentQuestion.question}</Text>
                    </View>
                )}
                <View style={styles.rowContainer}>
                    <TouchableOpacity style={styles.correctBtn} onPress={() => addScore()}>
                        <Text style={styles.buttonText}>CORRECT!</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.wrongBtn} onPress={() => subtractScore()}>
                        <Text style={styles.buttonText}>WRONG!</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonSection}>
                    <TouchableOpacity style={styles.saveButton} onPress={() => ScoreManager.saveJeopScore(totalScore)}>
                        <Text style={styles.buttonText}>Save High Score</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 18,
        backgroundColor: '#0b1026',
    },
    scrollContent: {
        paddingBottom: 24,
        gap: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 999,
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    backButtonText: {
        color: '#f8fafc',
        fontSize: 14,
        fontWeight: '700',
    },
    endRoundButton: {
        backgroundColor: '#a1124d',
        borderRadius: 12,
        paddingVertical: 9,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#f472b6',
    },
    scoreSection: {
        backgroundColor: '#111c44',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 18,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2f4bb8',
        shadowColor: '#1d4ed8',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 6,
    },
    scoreLabel: {
        fontSize: 14,
        color: '#9fb5ff',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scoreText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#f8cc35',
    },
    questionCard: {
        backgroundColor: '#0f1b3f',
        borderRadius: 18,
        padding: 18,
        borderWidth: 2,
        borderColor: '#365ccf',
        minHeight: 250,
        justifyContent: 'center',
    },
    questionCounter: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#bed4ff',
        marginBottom: 10,
        textAlign: 'center',
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 14,
    },
    categoryBadge: {
        fontSize: 13,
        color: '#ffffff',
        backgroundColor: '#2563eb',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        fontWeight: '700',
    },
    valueBadge: {
        fontSize: 13,
        color: '#1e1b4b',
        backgroundColor: '#f8cc35',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        fontWeight: '800',
    },
    questionText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 40,
    },
    buttonSection: {
        marginBottom: 0,
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#4f46e5',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#818cf8',
    },
    saveButton: {
        backgroundColor: '#0f766e',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#5eead4',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    answerContainer: {
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 12,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#475569',
    },
    answerLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#a5b4fc',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    answerText: {
        fontSize: 18,
        color: '#f8fafc',
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
        gap: 12,
    },
    correctBtn: {
        flex: 1,
        backgroundColor: '#0f9f6e',
        padding: 13,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#6ee7b7',
    },
    wrongBtn: {
        flex: 1,
        backgroundColor: '#be123c',
        padding: 13,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#fda4af',
    },
    endRoundText: {
        fontSize: 14,
        color: '#ffe4f2',
        fontWeight: '700',
    },
});

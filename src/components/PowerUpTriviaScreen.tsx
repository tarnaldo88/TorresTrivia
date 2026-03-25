import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ImageBackground,
    ActivityIndicator,
    Alert,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TriviaDatabase } from '../services/triviaDatabase';
import { PowerUpManager, PowerUpType, PowerUpResult } from '../services/powerUpManager';
import { TriviaQuestion } from '../types/index';
import { RootStackParamList } from '../navigation/MainNavigator';
import { PowerUpBar } from './PowerUpBar';

type TriviaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Trivia'>;

interface PowerUpTriviaScreenProps {
    playerId?: string;
    roundDuration?: number;
    onRoundEnd?: (finalScore: number, powerUpsUsed: number) => void;
}

export const PowerUpTriviaScreen: React.FC<PowerUpTriviaScreenProps> = ({
    playerId = 'default-player',
    roundDuration = 120,
    onRoundEnd,
}) => {
    const navigation = useNavigation<TriviaNavigationProp>();
    const [showAnswer, setShowAnswer] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [triviaDb, setTriviaDb] = useState<TriviaDatabase | null>(null);
    const [powerUpManager] = useState(() => new PowerUpManager());
    
    // Game state
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [currentScore, setCurrentScore] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(roundDuration);
    const [isTimerActive, setIsTimerActive] = useState(false);
    
    // Power-up state
    const [doublePointsActive, setDoublePointsActive] = useState(false);
    const [skipPassActive, setSkipPassActive] = useState(false);
    const [timeFreezeActive, setTimeFreezeActive] = useState(false);
    const [fiftyFiftyResult, setFiftyFiftyResult] = useState<any>(null);
    const [showPowerUps, setShowPowerUps] = useState(true);
    
    // Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scoreAnim = useRef(new Animated.Value(0)).current;

    const timerRef = useRef<any>(null);

    useEffect(() => {
        initializeTriviaDatabase();
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isTimerActive && timeRemaining > 0 && !timeFreezeActive) {
            timerRef.current = setTimeout(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            handleRoundComplete();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [timeRemaining, isTimerActive, timeFreezeActive]);

    const initializeTriviaDatabase = async () => {
        try {
            const db = new TriviaDatabase();
            await db.initialize();
            setTriviaDb(db);
            
            // Load first question
            const firstQuestion = await db.getRandomQuestion();
            setCurrentQuestion(firstQuestion);
            setLoading(false);
            setIsTimerActive(true);
        } catch (error) {
            console.error('Failed to initialize trivia database:', error);
            setLoading(false);
        }
    };

    const toggleAnswer = () => {
        if (!showAnswer) {
            // Record as incorrect when showing answer (can be changed with power-ups)
            recordAnswer(false);
        }
        setShowAnswer(!showAnswer);
    };

    const recordAnswer = (isCorrect: boolean) => {
        let points = 10;
        
        // Apply double points if active
        if (doublePointsActive) {
            points *= 2;
            setDoublePointsActive(false);
        }
        
        if (isCorrect) {
            setCorrectAnswers(correctAnswers + 1);
            setCurrentScore(currentScore + points);
            animateScore(points);
        }
    };

    const animateScore = (points: number) => {
        scoreAnim.setValue(0);
        Animated.timing(scoreAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    };

    const markCorrect = () => {
        recordAnswer(true);
        nextQuestion();
    };

    const markIncorrect = () => {
        recordAnswer(false);
        nextQuestion();
    };

    const skipQuestion = () => {
        if (skipPassActive) {
            // Use skip pass - no penalty
            setSkipPassActive(false);
            nextQuestion();
        } else {
            // Normal skip - small penalty
            setCurrentScore(Math.max(0, currentScore - 5));
            nextQuestion();
        }
    };

    const nextQuestion = async () => {
        if (!triviaDb) return;

        try {
            setShowAnswer(false);
            setQuestionsAnswered(questionsAnswered + 1);
            setFiftyFiftyResult(null);

            // Get next question
            const nextQ = await triviaDb.getRandomQuestion();
            setCurrentQuestion(nextQ);
        } catch (error) {
            console.error('Failed to load next question:', error);
            handleRoundComplete();
        }
    };

    const handleRoundComplete = () => {
        setIsTimerActive(false);
        
        Alert.alert(
            'Round Complete!',
            `Final Score: ${currentScore}\nCorrect Answers: ${correctAnswers}/${questionsAnswered}\nTime Remaining: ${timeRemaining}s`,
            [
                { text: 'View Stats', onPress: () => showStats() },
                { text: 'Home', onPress: () => navigation.navigate('Home') }
            ]
        );

        if (onRoundEnd) {
            const stats = powerUpManager.getPlayerStats(playerId);
            onRoundEnd(currentScore, stats.totalPowerUpsUsed);
        }
    };

    const showStats = () => {
        const stats = powerUpManager.getPlayerStats(playerId);
        const powerUps = powerUpManager.getAvailablePowerUps(playerId);
        
        Alert.alert(
            'Game Statistics',
            `Score: ${currentScore}\nAccuracy: ${Math.round((correctAnswers / Math.max(1, questionsAnswered)) * 100)}%\nPower-Ups Used: ${stats.totalPowerUpsUsed}\nPower-Ups Remaining: ${powerUps.reduce((sum, pu) => sum + pu.uses, 0)}`,
            [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
        );
    };

    const handlePowerUpUsed = (result: PowerUpResult) => {
        console.log('Power-up used:', result);
    };

    const handleTimeFreezeActive = (duration: number) => {
        setTimeFreezeActive(true);
        setTimeRemaining(prev => prev + duration);
        
        // Auto-disable after duration
        setTimeout(() => {
            setTimeFreezeActive(false);
        }, duration * 1000);
    };

    const handleDoublePointsActive = (multiplier: number) => {
        setDoublePointsActive(true);
    };

    const handleSkipPassActive = () => {
        setSkipPassActive(true);
    };

    const handleFiftyFiftyActive = (result: any) => {
        setFiftyFiftyResult(result);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading trivia questions...</Text>
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

    return (
        <ImageBackground 
            source={require('../assets/torresTrivia.png')}
            style={styles.background}
        >
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate('Home')}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.scoreContainer}>
                        <Animated.Text style={[styles.scoreText, {
                            transform: [{ scale: scoreAnim }]
                        }]}>
                            Score: {currentScore}
                        </Animated.Text>
                        {doublePointsActive && (
                            <Text style={styles.doublePointsText}>2X POINTS!</Text>
                        )}
                    </View>
                    
                    <TouchableOpacity
                        style={styles.powerUpToggleButton}
                        onPress={() => setShowPowerUps(!showPowerUps)}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.backButtonText}>Power-Ups</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.timerContainer}>
                    <Text style={[
                        styles.timerText,
                        timeFreezeActive && styles.timerTextFrozen
                    ]}>
                        Time: {timeRemaining}s
                    </Text>
                    {timeFreezeActive && (
                        <Text style={styles.frozenText}>FROZEN!</Text>
                    )}
                </View>

                <View style={styles.questionSection}>
                    <Text style={styles.questionCounter}>Question {questionsAnswered + 1}</Text>
                    <Text style={styles.categoryText}>{currentQuestion.category}</Text>
                    <Text style={styles.difficultyText}>Difficulty: {currentQuestion.difficulty}</Text>
                    
                    {fiftyFiftyResult && (
                        <View style={styles.fiftyFiftyContainer}>
                            <Text style={styles.fiftyFiftyTitle}>50/50 Active</Text>
                            <Text style={styles.fiftyFiftyResult}>
                                Removed: {fiftyFiftyResult.removedAnswers.join(', ')}
                            </Text>
                        </View>
                    )}
                    
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>
                </View>

                <View style={styles.buttonSection}>
                    <TouchableOpacity 
                        style={styles.button}
                        onPress={toggleAnswer}
                    >                        
                        <Text style={styles.buttonText}>
                            {showAnswer ? 'Hide Answer' : 'Show Answer'}
                        </Text>
                    </TouchableOpacity>

                    {showAnswer && (
                        <View style={styles.answerContainer}>
                            <Text style={styles.answerLabel}>Answer:</Text>
                            <Text style={styles.answerText}>{currentQuestion.answer}</Text>
                            
                            <View style={styles.answerButtons}>
                                <TouchableOpacity 
                                    style={[styles.answerButton, styles.correctButton]}
                                    onPress={markCorrect}
                                >
                                    <Text style={styles.answerButtonText}>Correct ✓</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.answerButton, styles.incorrectButton]}
                                    onPress={markIncorrect}
                                >
                                    <Text style={styles.answerButtonText}>Incorrect ✗</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.skipContainer}>
                        <TouchableOpacity 
                            style={[styles.button, skipPassActive && styles.skipPassButton]}
                            onPress={skipQuestion}
                        >
                            <Text style={styles.buttonText}>
                                {skipPassActive ? 'Skip (Free!)' : 'Skip (-5 pts)'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity 
                        style={styles.button}
                        onPress={nextQuestion}
                    >
                        <Text style={styles.buttonText}>Next Question</Text>
                    </TouchableOpacity>
                </View>

                {showPowerUps && (
                    <PowerUpBar
                        playerId={playerId}
                        currentQuestion={currentQuestion}
                        currentScore={currentScore}
                        timeRemaining={timeRemaining}
                        onPowerUpUsed={handlePowerUpUsed}
                        onTimeFreezeActive={handleTimeFreezeActive}
                        onDoublePointsActive={handleDoublePointsActive}
                        onSkipPassActive={handleSkipPassActive}
                        onFiftyFiftyActive={handleFiftyFiftyActive}
                        disabled={showAnswer}
                    />
                )}
            </View>
        </ImageBackground>
    );
};

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
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 999,
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    powerUpToggleButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 999,
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    backButtonText: {
        color: '#f8fafc',
        fontSize: 14,
        fontWeight: '700',
    },
    scoreContainer: {
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    doublePointsText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#F39C12',
        marginTop: 2,
    },
    loadingText: {
        color: '#fff',
        marginTop: 10,
        textAlign: 'center',
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 10,
    },
    timerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    timerTextFrozen: {
        color: '#3498DB',
    },
    frozenText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3498DB',
        marginTop: 2,
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
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    questionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffffff',
        textAlign: 'center',
        lineHeight: 32,
    },
    difficultyText: {
        fontSize: 14,
        color: '#f7f0f0ff',
        fontStyle: 'italic',
    },
    fiftyFiftyContainer: {
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        padding: 10,
        borderRadius: 8,
        marginVertical: 10,
        alignItems: 'center',
    },
    fiftyFiftyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3498DB',
        marginBottom: 5,
    },
    fiftyFiftyResult: {
        fontSize: 12,
        color: '#ffffff',
        textAlign: 'center',
    },
    buttonSection: {
        marginBottom: 20,
        gap: 12,
    },
    button: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    skipPassButton: {
        backgroundColor: '#27AE60',
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
        marginBottom: 15,
    },
    answerButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    answerButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    correctButton: {
        backgroundColor: '#28a745',
    },
    incorrectButton: {
        backgroundColor: '#dc3545',
    },
    answerButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    skipContainer: {
        gap: 8,
    },
    errorText: {
        fontSize: 16,
        color: '#ff0000',
        textAlign: 'center',
    },
});

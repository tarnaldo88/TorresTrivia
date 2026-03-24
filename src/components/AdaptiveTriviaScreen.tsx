import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ImageBackground,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdaptiveTriviaDatabase } from '../services/adaptiveTriviaDatabase';
import { AdaptiveDifficulty } from '../services/adaptiveDifficulty';
import { ProgressiveDifficultyManager } from '../services/progressiveDifficultyManager';
import { TriviaQuestion } from '../types/index';
import { RootStackParamList } from '../navigation/MainNavigator';

type TriviaNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Trivia'>;

interface AdaptiveTriviaScreenProps {
    playerId?: string;
    roundDuration?: number;
    enableProgressiveDifficulty?: boolean;
    totalRounds?: number;
    questionsPerRound?: number;
    onRoundEnd?: (finalScore: number, sessionData: any) => void;
}

export const AdaptiveTriviaScreen: React.FC<AdaptiveTriviaScreenProps> = ({
    playerId = 'default-player',
    roundDuration = 120,
    enableProgressiveDifficulty = false,
    totalRounds = 5,
    questionsPerRound = 10,
    onRoundEnd,
}) => {
    const navigation = useNavigation<TriviaNavigationProp>();
    const [showAnswer, setShowAnswer] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [adaptiveTriviaDb, setAdaptiveTriviaDb] = useState<AdaptiveTriviaDatabase | null>(null);
    const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<AdaptiveDifficulty | null>(null);
    const [progressiveManager, setProgressiveManager] = useState<ProgressiveDifficultyManager | null>(null);
    
    // Session tracking
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [currentRound, setCurrentRound] = useState(1);
    const [sessionId, setSessionId] = useState<string>('');
    const [questionStartTime, setQuestionStartTime] = useState<number>(0);
    const [adaptiveRecommendation, setAdaptiveRecommendation] = useState<any>(null);
    
    // Performance stats
    const [showStats, setShowStats] = useState(false);
    const [performanceStats, setPerformanceStats] = useState<any>(null);

    const questionStartTimeRef = useRef<number>(0);

    useEffect(() => {
        initializeAdaptiveTrivia();
    }, []);

    const initializeAdaptiveTrivia = async () => {
        try {
            // Initialize adaptive difficulty
            const adaptiveDiff = new AdaptiveDifficulty({
                enabled: true,
                difficultySensitivity: 0.6,
                minimumQuestionsBeforeAdjustment: 3,
                targetSuccessRate: 0.7,
                enableProgressiveDifficulty: enableProgressiveDifficulty,
                progressiveRate: 0.15,
                categoryAdaptation: true,
                timeBasedAdaptation: true,
            });

            // Initialize adaptive trivia database
            const adaptiveDb = new AdaptiveTriviaDatabase(adaptiveDiff);
            await adaptiveDb.initialize();

            // Initialize progressive difficulty manager if enabled
            let progManager: ProgressiveDifficultyManager | null = null;
            let newSessionId = '';

            if (enableProgressiveDifficulty) {
                progManager = new ProgressiveDifficultyManager(adaptiveDiff);
                const session = progManager.startProgressiveSession(playerId, totalRounds, questionsPerRound);
                newSessionId = session.sessionId;
                
                // Start adaptive session
                await adaptiveDb.startAdaptiveSession(playerId, undefined, questionsPerRound);
            } else {
                // Start regular adaptive session
                await adaptiveDb.startAdaptiveSession(playerId, undefined, 50);
                newSessionId = `${playerId}-${Date.now()}`;
            }

            setAdaptiveDifficulty(adaptiveDiff);
            setAdaptiveTriviaDb(adaptiveDb);
            setProgressiveManager(progManager);
            setSessionId(newSessionId);

            // Load first question
            const firstQuestion = enableProgressiveDifficulty && progManager
                ? await adaptiveDb.getNextAdaptiveQuestion()
                : await adaptiveDb.getAdaptiveRandomQuestion(playerId);

            if (firstQuestion) {
                setCurrentQuestion(firstQuestion);
                setQuestionStartTime(Date.now());
                questionStartTimeRef.current = Date.now();
                
                // Get initial recommendation
                const recommendation = adaptiveDb.getNextQuestionRecommendation(playerId);
                setAdaptiveRecommendation(recommendation);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to initialize adaptive trivia:', error);
            setLoading(false);
        }
    };

    const recordAnswer = (isCorrect: boolean) => {
        if (!adaptiveTriviaDb || !currentQuestion) return;

        const responseTime = (Date.now() - questionStartTimeRef.current) / 1000;
        
        // Record the answer
        adaptiveTriviaDb.recordPlayerAnswer(playerId, currentQuestion.id, isCorrect, responseTime);
        
        if (isCorrect) {
            setCorrectAnswers(correctAnswers + 1);
        }

        // Update performance stats
        if (adaptiveDifficulty) {
            const stats = adaptiveDifficulty.getPlayerStats(playerId);
            setPerformanceStats(stats);
        }
    };

    const toggleAnswer = () => {
        if (!showAnswer) {
            // Record answer when showing answer (assuming they want to check)
            recordAnswer(false); // Default to incorrect until they confirm
        }
        setShowAnswer(!showAnswer);
    };

    const markCorrect = () => {
        recordAnswer(true);
        nextQuestion();
    };

    const markIncorrect = () => {
        recordAnswer(false);
        nextQuestion();
    };

    const nextQuestion = async () => {
        if (!adaptiveTriviaDb) return;

        try {
            setShowAnswer(false);
            setQuestionsAnswered(questionsAnswered + 1);

            // Check if session is complete
            if (enableProgressiveDifficulty && progressiveManager) {
                const sessionProgress = adaptiveTriviaDb.getSessionProgress();
                if (sessionProgress.completedQuestions >= questionsPerRound) {
                    await completeRound();
                    return;
                }
            }

            // Get next question
            const nextQ = enableProgressiveDifficulty && progressiveManager
                ? await adaptiveTriviaDb.getNextAdaptiveQuestion()
                : await adaptiveTriviaDb.getAdaptiveRandomQuestion(playerId);

            if (nextQ) {
                setCurrentQuestion(nextQ);
                setQuestionStartTime(Date.now());
                questionStartTimeRef.current = Date.now();
                
                // Update recommendation
                const recommendation = adaptiveTriviaDb.getNextQuestionRecommendation(playerId);
                setAdaptiveRecommendation(recommendation);
            } else {
                // Session completed
                handleSessionComplete();
            }
        } catch (error) {
            console.error('Failed to load next question:', error);
        }
    };

    const completeRound = async () => {
        if (!progressiveManager || !adaptiveTriviaDb) return;

        try {
            const sessionProgression = progressiveManager.getSessionProgression(sessionId);
            if (sessionProgression) {
                const updatedSession = progressiveManager.completeRound(
                    sessionId,
                    correctAnswers,
                    questionsAnswered,
                    adaptiveTriviaDb.getSessionProgress().sessionDuration / questionsAnswered
                );

                if (updatedSession.currentRound > updatedSession.totalRounds) {
                    // Session complete
                    handleSessionComplete();
                } else {
                    // Start next round
                    setCurrentRound(updatedSession.currentRound);
                    setQuestionsAnswered(0);
                    setCorrectAnswers(0);
                    
                    // Get questions for next round
                    const allQuestions = await adaptiveTriviaDb.getAllQuestions();
                    const roundQuestions = await progressiveManager.getRoundQuestions(
                        sessionId,
                        allQuestions
                    );

                    Alert.alert(
                        'Round Complete!',
                        `Round ${updatedSession.currentRound - 1} completed!\nScore: ${correctAnswers}/${questionsAnswered}\n\nStarting Round ${updatedSession.currentRound}`,
                        [{ text: 'Continue', onPress: () => nextQuestion() }]
                    );
                }
            }
        } catch (error) {
            console.error('Failed to complete round:', error);
        }
    };

    const handleSessionComplete = () => {
        let sessionSummary: any = {};

        if (progressiveManager && enableProgressiveDifficulty) {
            const result = progressiveManager.endSession(sessionId);
            sessionSummary = result;
        } else if (adaptiveTriviaDb) {
            sessionSummary = adaptiveTriviaDb.endSession(playerId);
        }

        Alert.alert(
            'Session Complete!',
            `Final Score: ${correctAnswers}/${questionsAnswered}\nSuccess Rate: ${Math.round((correctAnswers / questionsAnswered) * 100)}%`,
            [
                { text: 'View Stats', onPress: () => setShowStats(true) },
                { text: 'Home', onPress: () => navigation.navigate('Home') }
            ]
        );

        if (onRoundEnd) {
            onRoundEnd(correctAnswers, sessionSummary);
        }
    };

    const toggleStats = () => {
        if (adaptiveDifficulty && !showStats) {
            const stats = adaptiveDifficulty.getPlayerStats(playerId);
            setPerformanceStats(stats);
        }
        setShowStats(!showStats);
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Initializing Adaptive Difficulty...</Text>
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

    if (showStats && performanceStats) {
        return (
            <ImageBackground 
                source={require('../assets/torresTrivia.png')}
                style={styles.background}
            >
                <View style={styles.container}>
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => setShowStats(false)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.backButtonText}>Back to Game</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.statsContainer}>
                        <Text style={styles.statsTitle}>Performance Statistics</Text>
                        
                        <View style={styles.statSection}>
                            <Text style={styles.statSectionTitle}>Overall Performance</Text>
                            <Text style={styles.statText}>Total Questions: {performanceStats.overall.totalQuestions}</Text>
                            <Text style={styles.statText}>Correct Answers: {performanceStats.overall.correctAnswers}</Text>
                            <Text style={styles.statText}>Success Rate: {Math.round(performanceStats.overall.successRate * 100)}%</Text>
                            <Text style={styles.statText}>Average Response Time: {performanceStats.overall.averageResponseTime.toFixed(1)}s</Text>
                            <Text style={styles.statText}>Current Streak: {performanceStats.overall.currentStreak}</Text>
                            <Text style={styles.statText}>Best Streak: {performanceStats.overall.bestStreak}</Text>
                        </View>

                        {adaptiveRecommendation && (
                            <View style={styles.recommendationSection}>
                                <Text style={styles.statSectionTitle}>Next Question Recommendation</Text>
                                <Text style={styles.statText}>Difficulty: {adaptiveRecommendation.recommendedDifficulty}</Text>
                                <Text style={styles.statText}>Confidence: {Math.round(adaptiveRecommendation.confidence * 100)}%</Text>
                                <Text style={styles.statText}>Reason: {adaptiveRecommendation.reason}</Text>
                            </View>
                        )}

                        {enableProgressiveDifficulty && (
                            <View style={styles.progressSection}>
                                <Text style={styles.statSectionTitle}>Session Progress</Text>
                                <Text style={styles.statText}>Round: {currentRound}/{totalRounds}</Text>
                                <Text style={styles.statText}>Questions: {questionsAnswered}/{questionsPerRound}</Text>
                                <Text style={styles.statText}>Round Score: {correctAnswers}/{questionsAnswered}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ImageBackground>
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
                    <TouchableOpacity
                        style={styles.statsButton}
                        onPress={toggleStats}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.backButtonText}>Stats</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.questionSection}>
                    {enableProgressiveDifficulty && (
                        <Text style={styles.roundText}>Round {currentRound}/{totalRounds}</Text>
                    )}
                    <Text style={styles.questionCounter}>Question {questionsAnswered + 1}</Text>
                    <Text style={styles.categoryText}>{currentQuestion.category}</Text>
                    <Text style={styles.difficultyText}>Difficulty: {currentQuestion.difficulty}</Text>
                    
                    {adaptiveRecommendation && (
                        <View style={styles.recommendationBadge}>
                            <Text style={styles.recommendationText}>
                                Recommended: {adaptiveRecommendation.recommendedDifficulty} ({Math.round(adaptiveRecommendation.confidence * 100)}%)
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

                    <TouchableOpacity 
                        style={styles.button}
                        onPress={nextQuestion}
                    >
                        <Text style={styles.buttonText}>Next Question</Text>
                    </TouchableOpacity>
                </View>
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
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 999,
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    statsButton: {
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
    loadingText: {
        color: '#fff',
        marginTop: 10,
        textAlign: 'center',
    },
    roundText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fdfdfdff',
        marginBottom: 8,
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
    difficultyText: {
        fontSize: 14,
        color: '#f7f0f0ff',
        fontStyle: 'italic',
    },
    recommendationBadge: {
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginTop: 10,
    },
    recommendationText: {
        fontSize: 12,
        color: '#007AFF',
        fontWeight: '600',
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
    errorText: {
        fontSize: 16,
        color: '#ff0000',
        textAlign: 'center',
    },
    statsContainer: {
        flex: 1,
        padding: 20,
    },
    statsTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    statSection: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    statSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    statText: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 5,
    },
    recommendationSection: {
        backgroundColor: 'rgba(0, 123, 255, 0.2)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    progressSection: {
        backgroundColor: 'rgba(40, 167, 69, 0.2)',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
});

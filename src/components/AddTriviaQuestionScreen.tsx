import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    ScrollView,
    SafeAreaView,    
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { TriviaDatabase } from '../services/triviaDatabase';
import { useNavigation } from '@react-navigation/native';

type difficultyOption = "" | "Easy" | "Medium" | "Hard";

export const AddTriviaQuestionScreen = () => {
    const navigation = useNavigation();
    const [triviaDb, setTriviaDb] = useState<TriviaDatabase | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [difficulty, setDifficulty] = useState<difficultyOption>("");
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');

    const canSubmit = !!difficulty.trim() && !!question.trim() && !!answer.trim() && !!category.trim();

    useEffect(() => {
        initializeTriviaDatabase();
    }, []);

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

    const handleAddQuestion = async () => {
        if (!triviaDb) return;

        setSubmitting(true);
        try {
            await triviaDb.addQuestion(difficulty, question, answer, category);
            setDifficulty('');
            setQuestion('');
            setAnswer('');
            setCategory('');
            navigation.goBack();
        } catch (error) {
            console.error('Failed to add question:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.headerRow}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.card}>
                        <Text style={styles.title}>Add Trivia Question</Text>
                        <Text style={styles.subtitle}>Create a new question for the trivia deck.</Text>

                        {loading ? (
                            <View style={styles.loadingWrap}>
                                <ActivityIndicator size="large" color="#2563eb" />
                                <Text style={styles.loadingText}>Loading question database...</Text>
                            </View>
                        ) : (
                            <View style={styles.form}>
                                <Text style={styles.label}>Difficulty</Text>
                                <View style={styles.difficultyRow}>
                                    {(['Easy', 'Medium', 'Hard'] as difficultyOption[]).map((level) => (
                                        <TouchableOpacity
                                            key={level}
                                            style={[
                                                styles.difficultyChip,
                                                difficulty === level && styles.difficultyChipSelected,
                                            ]}
                                            onPress={() => setDifficulty(level)}
                                            activeOpacity={0.85}
                                        >
                                            <Text
                                                style={[
                                                    styles.difficultyChipText,
                                                    difficulty === level && styles.difficultyChipTextSelected,
                                                ]}
                                            >
                                                {level}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={styles.label}>Question</Text>
                                <TextInput
                                    style={[styles.input, styles.largeInput]}
                                    placeholder="Enter the trivia question"
                                    placeholderTextColor="#9ca3af"
                                    value={question}
                                    onChangeText={setQuestion}
                                    multiline
                                />

                                <Text style={styles.label}>Answer</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter the correct answer"
                                    placeholderTextColor="#9ca3af"
                                    value={answer}
                                    onChangeText={setAnswer}
                                />
                                <Text style={styles.label}>Category</Text>
                                {(['Science', 'History', 'Sports', 'Literature', 'Geography', 'Math']).map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.difficultyChip, cat === category && styles.difficultyChipSelected]}
                                    >
                                        <Text style={[styles.difficultyChipText, cat === category && styles.difficultyChipTextSelected]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        (!canSubmit || submitting) && styles.buttonDisabled,
                                    ]}
                                    onPress={handleAddQuestion}
                                    disabled={!canSubmit || submitting}
                                    activeOpacity={0.9}
                                >
                                    <Text style={styles.buttonText}>{submitting ? 'Adding...' : 'Add Question'}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 32,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 14,
    },
    backButton: {
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
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#020617',
        shadowOpacity: 0.14,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 5,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#475569',
        marginBottom: 20,
    },
    loadingWrap: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 22,
        gap: 14,
    },
    loadingText: {
        color: '#334155',
        fontSize: 14,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    difficultyRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 14,
    },
    difficultyChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        backgroundColor: '#f8fafc',
        alignItems: 'center',
    },
    difficultyChipSelected: {
        borderColor: '#2563eb',
        backgroundColor: '#dbeafe',
    },
    difficultyChipText: {
        color: '#1e293b',
        fontSize: 14,
        fontWeight: '700',
    },
    difficultyChipTextSelected: {
        color: '#1d4ed8',
    },
    input: {
        width: '100%',
        minHeight: 46,
        backgroundColor: '#f8fafc',
        borderColor: '#cbd5e1',
        borderWidth: 1,
        marginBottom: 14,
        paddingHorizontal: 12,
        paddingVertical: 11,
        borderRadius: 12,
        color: '#0f172a',
        fontSize: 15,
    },
    largeInput: {
        minHeight: 88,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 6,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

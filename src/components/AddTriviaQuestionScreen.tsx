import { useState, useEffect } from 'react';  
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { TriviaDatabase } from '../services/triviaDatabase';
import { useNavigation } from '@react-navigation/native';

export const AddTriviaQuestionScreen = () => {
    const navigation = useNavigation();
    const [triviaDb, setTriviaDb] = useState<TriviaDatabase | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [difficulty, setDifficulty] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');

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
            // Clear form after successful submission
            setDifficulty('');
            setQuestion('');
            setAnswer('');
            setCategory('');
            // Navigate back after successful addition
            navigation.goBack();
        } catch (error) {
            console.error('Failed to add question:', error);
        } finally {
            setSubmitting(false);
        }
    };


    return (
    <View style={styles.container}>
        <Text style={styles.title}>Add Trivia Question</Text>
        {loading ? (
            <>
                <ActivityIndicator size="large" color="#0000ff" />
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
            </>
        ) : (
            <View style={styles.form}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text>Go Back</Text>
                </TouchableOpacity>
                <Text style={styles.label}>Difficulty</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Difficulty"
                    value={difficulty}
                    onChangeText={setDifficulty}
                />
                <Text style={styles.label}>Question</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Question"
                    value={question}
                    onChangeText={setQuestion}
                />
                <Text style={styles.label}>Answer</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Answer"
                    value={answer}
                    onChangeText={setAnswer}
                />
                <Text style={styles.label}>Category</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Category"
                    value={category}
                    onChangeText={setCategory}
                />
                <TouchableOpacity style={styles.button} onPress={handleAddQuestion} disabled={submitting}>
                    <Text style={styles.buttonText}>{submitting ? 'Adding...' : 'Add Question'}</Text>
                </TouchableOpacity>
            </View>
        )}   
    </View>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '80%',
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    form:{
        width: '80%',
        alignItems: 'center',
    },
    label:{
        
    },
});
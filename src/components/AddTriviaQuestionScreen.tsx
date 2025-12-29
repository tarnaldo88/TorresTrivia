import React, { useState, useEffect } from 'react';  
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ImageBackground,
    ActivityIndicator,
    TextInput,
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


    return (
    <View style={styles.container}>
        <Text style={styles.title}>Add Trivia Question</Text>
        {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
        ) : (
            <View>
                <TextInput
                    style={styles.input}
                    placeholder="Difficulty"
                    value={difficulty}
                    onChangeText={setDifficulty}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Question"
                    value={question}
                    onChangeText={setQuestion}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Answer"
                    value={answer}
                    onChangeText={setAnswer}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Category"
                    value={category}
                    onChangeText={setCategory}
                />
                <TouchableOpacity style={styles.button} onPress={() => triviaDb?.addQuestion(difficulty, question, answer, category)}>
                    <Text style={styles.buttonText}>Add Question</Text>
                </TouchableOpacity>
        )
        )}
    </View>
);
};
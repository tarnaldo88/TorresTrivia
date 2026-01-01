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

export const AlterTriviaQuestionScreen= React.FC = () => {
    const [triviaDb, setTriviaDb] = useState<TriviaDatabase | null>(null);
    const [loading, setLoading] = useState(true);
    const [difficulty, setDifficulty] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');
    const [triviaQuestion, setTriviaQuestion] = useState<TriviaQuestion | null>(null);

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


    return(
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Text>Difficulty</Text>
                <TextInput 
                    value={difficulty}
                    onChangeText = {text => {setDifficulty(text)}}
                    style={styles.inputText}
                />
                <Text>Question</Text>
                <TextInput 
                    value={question}
                    onChangeText = {text => {setQuestion(text)}}
                    style={styles.inputText}
                />
                <Text>Answer</Text>
                <TextInput 
                    value={answer}
                    onChangeText = {text => {setAnswer(text)}}
                    style={styles.inputText}
                />
                <Text>Category</Text>
                <TextInput 
                    value={category}
                    onChangeText = {text => {setCategory(text)}}
                    style={styles.inputText}
                />
            </View>
            <View style={styles.triviaQuestionContainer}>
                <Text style={styles.triviaQuestLabel}>Trivia Question ID</Text>
                <Text>{triviaQuestion?.id}</Text>
                <Text style={styles.triviaQuestLabel}>Trivia Question:</Text>
                <Text>{triviaQuestion?.question}</Text>
                <Text style={styles.triviaQuestLabel}>Trivia Answer:</Text>
                <Text>{triviaQuestion?.answer}</Text>
                <Text style={styles.triviaQuestLabel}>Trivia Category:</Text>
                <Text>{triviaQuestion?.category}</Text>
                <Text style={styles.triviaQuestLabel}>Trivia Difficulty:</Text>
                <Text>{triviaQuestion?.difficulty}</Text>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitBtn:{
        backgroundColor: 'white',
        color: 'purple',
        justifyContent: 'center',
    },
    submitBtnSelected: {
        backgroundColor: 'green',
        color: 'white',
        fontWeight: 'bold',
        justifyContent: 'center',
    },
    submitBtnText: {
      fontweight: 'bold',
      fontSize: 20,
      color: 'white',
    },
    inputText:{
        padding: 10,
        borderColor: '#000',
        borderWidth: 1,
        margin: 12,
    },
    inputContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    triviaQuestionContainer:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    triviaQuestLabel:{
        fontSize: 20,
        color: '#ddf8f7ff',
        marginBottom: 10,
    },
    triviaQuestionPart:{
        fontSize: 18,
        color: '#e5fcfbff',
    },
})
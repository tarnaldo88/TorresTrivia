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
import { addItems } from '../services/databaseSeeder';

export const AlterTriviaQuestionScreen= React.FC = () => {
    const [triviaDb, setTriviaDb] = useState<TriviaDatabase | null>(null);
    const [loading, setLoading] = useState(true);
    const [difficulty, setDifficulty] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');
    const [triviaQuestion, setTriviaQuestion] = useState<TriviaQuestion | null>(null);
    const [questionId, setQuestionId] = useState('');

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

    const handleAlterTriviaQuestion = async () => {
        try {
            // await triviaDb?.alterTriviaQuestion(triviaQuestion?.id || '', difficulty, question, answer, category);
            await addItems([{ 
                id: triviaQuestion?.id || '', 
                text: triviaQuestion?.question || '', 
                category: triviaQuestion?.category || '' 
            }]);
            console.log('Trivia question altered successfully');
        } catch (error) {
            console.error('Failed to alter trivia question:', error);
        }
    }

    const getTriviaQuestionById = async (questId: string) => {
        try {
            const triviaQuestion = await triviaDb?.getQuestionById(triviaQuestion?.id || '');
            setTriviaQuestion(triviaQuestion);
        } catch (error) {
            console.error('Failed to get trivia question by id:', error);
        }
    }


    return(
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Text>Difficulty</Text>
                <TextInput 
                    value={difficulty}
                    onChangeText = {(text: string) => {setDifficulty(text)}}
                    style={styles.inputText}
                />
                <Text>Question</Text>
                <TextInput 
                    value={question}
                    onChangeText = {(text: string) => {setQuestion(text)}}
                    style={styles.inputText}
                />
                <Text>Answer</Text>
                <TextInput 
                    value={answer}
                    onChangeText = {(text: string) => {setAnswer(text)}}
                    style={styles.inputText}
                />
                <Text>Category</Text>
                <TextInput 
                    value={category}
                    onChangeText = {(text: string) => {setCategory(text)}}
                    style={styles.inputText}
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    value={questionId}
                    onChangeText={(text: string) => {setQuestionId(text)}}
                    placeholder="Enter question ID"
                    style={styles.inputText}
                />
                <TouchableOpacity style={styles.submitBtn} onPress={() => getTriviaQuestionById(questionId)}>
                    <Text style={styles.submitBtnText}>Get Question</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.triviaQuestionContainer}>
                <Text style={styles.triviaQuestLabel}>Trivia Question ID</Text>
                <Text style={styles.triviaQuestionPart}>{triviaQuestion?.id}</Text>
                <Text style={styles.triviaQuestLabel}>Trivia Question:</Text>
                <Text style={styles.triviaQuestionPart}>{triviaQuestion?.question}</Text>
                <Text style={styles.triviaQuestLabel}>Trivia Answer:</Text>
                <Text style={styles.triviaQuestionPart}>{triviaQuestion?.answer}</Text>
                <Text style={styles.triviaQuestLabel}>Trivia Category:</Text>
                <Text style={styles.triviaQuestionPart}>{triviaQuestion?.category}</Text>
                <Text style={styles.triviaQuestLabel}>Trivia Difficulty:</Text>
                <Text style={styles.triviaQuestionPart}>{triviaQuestion?.difficulty}</Text>
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleAlterTriviaQuestion}>
                <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>
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
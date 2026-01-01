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
// import { TriviaQuestion } from '../types/index';

export const AlterTriviaQuestionScreen= React.FC = () => {
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


    return(
        <View style={styles.container}>

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
})
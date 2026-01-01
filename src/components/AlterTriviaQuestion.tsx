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


    return(
        <View>

        </View>

    );
}
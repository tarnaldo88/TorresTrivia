import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { TriviaQuestion } from '../types/index';

const QuestionList: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);

    return (
        <View>
            <Text>Question List</Text>
        </View>
    );
}
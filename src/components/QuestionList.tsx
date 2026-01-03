import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { TriviaQuestion } from '../types/index';

const QuestionList: React.FC = () => {
    const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);

    const handleNext = () => {
        const currentIndex = QuestionList.findIndex((q) => q === currentQuestion);
        const nextIndex = (currentIndex + 1) % QuestionList.length;
        setCurrentQuestion(QuestionList[nextIndex]);
    }

    return (
        <View>
            <Text>Question List</Text>
        </View>
    );
}
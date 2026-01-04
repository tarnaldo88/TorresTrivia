import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { TriviaQuestion } from '../types/index';

export const QuestionList: React.FC = ({questions}) => {
    // const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const handleNext = () => {
        setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % QuestionList.length);
    }

    const handlePrevious = () => {
        setCurrentQuestionIndex((prevIndex) => (prevIndex - 1 + QuestionList.length) % QuestionList.length);
    }

    // const handleNext = () => {
    //     const currentIndex = QuestionList.findIndex((q) => q === currentQuestion);
    //     const nextIndex = (currentIndex + 1) % QuestionList.length;
    //     setCurrentQuestion(QuestionList[nextIndex]);
    // }

    return (
        <View>
            <Text>Question List</Text>
            {questions.length > 0 ? (
                <>
                    <Text>Current Question: {currentQuestionIndex + 1} of {questions.length}</Text>
                    <Text>{questions[currentQuestionIndex].question}</Text>
                    <Text>Answer: {questions[currentQuestionIndex].answer}</Text>
                </>
            )
            }
            
        </View>
    );
}
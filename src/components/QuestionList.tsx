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
            <FlatList
                data={QuestionList}
                keyExtractor={(question) => question.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setCurrentQuestion(item)}>
                        <Text>Question: {item.id}</Text>
                        <Text>{item.question}</Text>
                        <Text>Answer: {item.answer}</Text>
                    </TouchableOpacity>
                )}
            />
            {currentQuestion && (
                <View>
                    <TouchableOpacity onPress={handleNext}>
                        <Text>Next</Text>
                    </TouchableOpacity>
                    <Text>Current Question: {currentQuestion?.question}</Text>
                    <TouchableOpacity onPress={() => setCurrentQuestion(null)}>
                        <Text>Clear</Text>
                    </TouchableOpacity>
                </View>
            )}
            
        </View>
    );
}
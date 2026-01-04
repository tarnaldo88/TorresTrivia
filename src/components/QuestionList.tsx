import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            <Text style={styles.title}>Question List</Text>
            {questions.length > 0 ? (
                <>
                    <Text>Current Question: {currentQuestionIndex + 1} of {questions.length}</Text>
                    <Text>{questions[currentQuestionIndex].question}</Text>
                    <Text>Answer: {questions[currentQuestionIndex].answer}</Text>
                    <Text>Category: {questions[currentQuestionIndex].category}</Text>
                    <Text>Difficulty: {questions[currentQuestionIndex].difficulty}</Text>
                    <Text>Question ID: {questions[currentQuestionIndex].id}</Text>
                    <TouchableOpacity style={styles.btnPrevious} onPress={handlePrevious}>
                        <Text style={styles.buttonText}>Previous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonNext} onPress={handleNext}>
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <Text style={styles.title}>No questions available.</Text>
            )
            }
            
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },   
    buttonNext: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        margin: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    btnPrevious:{
        backgroundColor: 'purple',
        padding: 10,
        borderRadius: 5,
        margin: 10,
    },
    title:{
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
})
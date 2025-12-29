import React, { useState, useEffect } from 'react';  
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ImageBackground,
    ActivityIndicator,
} from 'react-native';
import { TriviaDatabase } from '../services/triviaDatabase';
import { TriviaQuestion } from '../types/index';

export const AddTriviaQuestionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Trivia Question</Text>
    </View>
  );
};
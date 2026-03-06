import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { QuestionPackManager } from '../services/questionPackManager';
import { RootStackParamList } from '../navigation/MainNavigator';

type CreateQuestionPackNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateQuestionPack'>;

interface QuestionFormData {
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

export const CreateQuestionPackScreen: React.FC = () => {
  const navigation = useNavigation<CreateQuestionPackNavigationProp>();
  const [packManager] = useState(() => new QuestionPackManager());
  
  // Pack details
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [packAuthor, setPackAuthor] = useState('');
  const [packCategory, setPackCategory] = useState('');
  const [packDifficulty, setPackDifficulty] = useState('');
  const [packTags, setPackTags] = useState('');
  
  // Questions
  const [questions, setQuestions] = useState<QuestionFormData[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionFormData>({
    question: '',
    answer: '',
    category: '',
    difficulty: '',
  });
  
  const [loading, setLoading] = useState(false);

  const categories = [
    'Science', 'History', 'Geography', 'Literature', 'Sports',
    'Movies', 'TV Shows', 'Music', 'Technology', 'General Knowledge'
  ];
  
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const addQuestion = () => {
    if (!currentQuestion.question.trim() || !currentQuestion.answer.trim()) {
      Alert.alert('Error', 'Question and answer are required');
      return;
    }
    
    setQuestions([...questions, { ...currentQuestion }]);
    setCurrentQuestion({
      question: '',
      answer: '',
      category: '',
      difficulty: '',
    });
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const createPack = async () => {
    if (!packName.trim()) {
      Alert.alert('Error', 'Pack name is required');
      return;
    }
    
    if (questions.length === 0) {
      Alert.alert('Error', 'At least one question is required');
      return;
    }

    setLoading(true);
    
    try {
      // Create the pack
      const packId = await packManager.createPack({
        name: packName.trim(),
        description: packDescription.trim() || undefined,
        author: packAuthor.trim() || undefined,
        category: packCategory.trim() || undefined,
        difficulty: packDifficulty.trim() || undefined,
        isPublic: false,
        tags: packTags.trim() ? packTags.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined,
      });

      // Add all questions to the pack
      for (const question of questions) {
        await packManager.addQuestionToPack(packId, {
          question: question.question.trim(),
          answer: question.answer.trim(),
          category: question.category.trim() || undefined,
          difficulty: question.difficulty.trim() || undefined,
        });
      }

      Alert.alert(
        'Success!',
        `Question pack "${packName}" created with ${questions.length} questions`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Failed to create pack:', error);
      Alert.alert('Error', 'Failed to create question pack');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionInput = () => (
    <View style={styles.questionInputCard}>
      <Text style={styles.cardTitle}>Add Question</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Question"
        value={currentQuestion.question}
        onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, question: text })}
        placeholderTextColor="#94a3b8"
        multiline
      />
      
      <TextInput
        style={styles.input}
        placeholder="Answer"
        value={currentQuestion.answer}
        onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, answer: text })}
        placeholderTextColor="#94a3b8"
        multiline
      />
      
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Category (optional)"
          value={currentQuestion.category}
          onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, category: text })}
          placeholderTextColor="#94a3b8"
        />
        
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Difficulty (optional)"
          value={currentQuestion.difficulty}
          onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, difficulty: text })}
          placeholderTextColor="#94a3b8"
        />
      </View>
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={addQuestion}
      >
        <Text style={styles.addButtonText}>Add Question</Text>
      </TouchableOpacity>
    </View>
  );

  const renderQuestionsList = () => (
    <View style={styles.questionsListCard}>
      <Text style={styles.cardTitle}>Questions ({questions.length})</Text>
      
      {questions.length === 0 ? (
        <Text style={styles.emptyText}>No questions added yet</Text>
      ) : (
        questions.map((question, index) => (
          <View key={index} style={styles.questionItem}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>Q{index + 1}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeQuestion(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.questionText}>{question.question}</Text>
            <Text style={styles.answerText}>A: {question.answer}</Text>
            {(question.category || question.difficulty) && (
              <View style={styles.questionMeta}>
                {question.category && (
                  <Text style={styles.metaText}>Category: {question.category}</Text>
                )}
                {question.difficulty && (
                  <Text style={styles.metaText}>Difficulty: {question.difficulty}</Text>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Pack</Text>
          <TouchableOpacity
            style={[styles.createButton, loading && styles.disabledButton]}
            onPress={createPack}
            disabled={loading}
          >
            <Text style={styles.createButtonText}>
              {loading ? 'Creating...' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.packDetailsCard}>
            <Text style={styles.cardTitle}>Pack Details</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Pack Name *"
              value={packName}
              onChangeText={setPackName}
              placeholderTextColor="#94a3b8"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={packDescription}
              onChangeText={setPackDescription}
              placeholderTextColor="#94a3b8"
              multiline
            />
            
            <TextInput
              style={styles.input}
              placeholder="Author (optional)"
              value={packAuthor}
              onChangeText={setPackAuthor}
              placeholderTextColor="#94a3b8"
            />
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Category (optional)"
                value={packCategory}
                onChangeText={setPackCategory}
                placeholderTextColor="#94a3b8"
              />
              
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Difficulty (optional)"
                value={packDifficulty}
                onChangeText={setPackDifficulty}
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Tags (comma-separated, optional)"
              value={packTags}
              onChangeText={setPackTags}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {renderQuestionInput()}
          {renderQuestionsList()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  backButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: '#64748b',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  packDetailsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  questionInputCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  questionsListCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  questionItem: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64b5f6',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    borderRadius: 999,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  questionText: {
    fontSize: 14,
    color: '#f8fafc',
    marginBottom: 4,
    fontWeight: '600',
  },
  answerText: {
    fontSize: 13,
    color: '#cbd5e1',
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 11,
    color: '#94a3b8',
  },
});

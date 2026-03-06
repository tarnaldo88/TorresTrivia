import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { QuestionPackManager } from '../services/questionPackManager';
import { QuestionPack, PackQuestion } from '../types/index';
import { RootStackParamList } from '../navigation/MainNavigator';

type QuestionPackEditorNavigationProp = NativeStackNavigationProp<RootStackParamList, 'QuestionPackEditor'>;
type QuestionPackEditorRouteProp = RouteProp<RootStackParamList, 'QuestionPackEditor'>;

interface QuestionFormData {
  id?: string;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

export const QuestionPackEditorScreen: React.FC = () => {
  const navigation = useNavigation<QuestionPackEditorNavigationProp>();
  const route = useRoute<QuestionPackEditorRouteProp>();
  const { packId } = route.params;
  
  const [packManager] = useState(() => new QuestionPackManager());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Pack details
  const [pack, setPack] = useState<QuestionPack | null>(null);
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [packAuthor, setPackAuthor] = useState('');
  const [packCategory, setPackCategory] = useState('');
  const [packDifficulty, setPackDifficulty] = useState('');
  const [packTags, setPackTags] = useState('');
  
  // Questions
  const [questions, setQuestions] = useState<PackQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionFormData>({
    question: '',
    answer: '',
    category: '',
    difficulty: '',
  });
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);

  useEffect(() => {
    loadPack();
  }, [packId]);

  const loadPack = async () => {
    try {
      const packData = await packManager.getPackById(packId);
      if (!packData) {
        Alert.alert('Error', 'Pack not found');
        navigation.goBack();
        return;
      }

      const packQuestions = await packManager.getPackQuestions(packId);
      
      setPack(packData);
      setPackName(packData.name);
      setPackDescription(packData.description || '');
      setPackAuthor(packData.author || '');
      setPackCategory(packData.category || '');
      setPackDifficulty(packData.difficulty || '');
      setPackTags(packData.tags ? packData.tags.join(', ') : '');
      setQuestions(packQuestions);
    } catch (error) {
      console.error('Failed to load pack:', error);
      Alert.alert('Error', 'Failed to load pack');
    } finally {
      setLoading(false);
    }
  };

  const savePack = async () => {
    if (!pack || !packName.trim()) {
      Alert.alert('Error', 'Pack name is required');
      return;
    }

    setSaving(true);
    
    try {
      await packManager.updatePack(pack.id, {
        name: packName.trim(),
        description: packDescription.trim() || undefined,
        author: packAuthor.trim() || undefined,
        category: packCategory.trim() || undefined,
        difficulty: packDifficulty.trim() || undefined,
        tags: packTags.trim() ? packTags.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined,
      });

      Alert.alert('Success', 'Pack updated successfully');
    } catch (error) {
      console.error('Failed to save pack:', error);
      Alert.alert('Error', 'Failed to save pack');
    } finally {
      setSaving(false);
    }
  };

  const addOrUpdateQuestion = async () => {
    if (!currentQuestion.question.trim() || !currentQuestion.answer.trim()) {
      Alert.alert('Error', 'Question and answer are required');
      return;
    }

    try {
      if (editingQuestion) {
        // Update existing question
        await packManager.updatePackQuestion(editingQuestion, {
          question: currentQuestion.question.trim(),
          answer: currentQuestion.answer.trim(),
          category: currentQuestion.category.trim() || undefined,
          difficulty: currentQuestion.difficulty.trim() || undefined,
        });
        
        setQuestions(questions.map(q => 
          q.id === editingQuestion 
            ? { ...q, question: currentQuestion.question.trim(), answer: currentQuestion.answer.trim(), 
                category: currentQuestion.category.trim() || undefined, difficulty: currentQuestion.difficulty.trim() || undefined }
            : q
        ));
      } else {
        // Add new question
        const questionId = await packManager.addQuestionToPack(packId, {
          question: currentQuestion.question.trim(),
          answer: currentQuestion.answer.trim(),
          category: currentQuestion.category.trim() || undefined,
          difficulty: currentQuestion.difficulty.trim() || undefined,
        });
        
        const newQuestion: PackQuestion = {
          id: questionId,
          packId,
          question: currentQuestion.question.trim(),
          answer: currentQuestion.answer.trim(),
          category: currentQuestion.category.trim() || undefined,
          difficulty: currentQuestion.difficulty.trim() || undefined,
          orderIndex: questions.length,
        };
        
        setQuestions([...questions, newQuestion]);
      }

      // Reset form
      setCurrentQuestion({
        question: '',
        answer: '',
        category: '',
        difficulty: '',
      });
      setEditingQuestion(null);
    } catch (error) {
      console.error('Failed to save question:', error);
      Alert.alert('Error', 'Failed to save question');
    }
  };

  const deleteQuestion = async (questionId: string) => {
    Alert.alert(
      'Delete Question',
      'Are you sure you want to delete this question?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await packManager.deletePackQuestion(questionId);
              setQuestions(questions.filter(q => q.id !== questionId));
            } catch (error) {
              console.error('Failed to delete question:', error);
              Alert.alert('Error', 'Failed to delete question');
            }
          }
        }
      ]
    );
  };

  const editQuestion = (question: PackQuestion) => {
    setCurrentQuestion({
      question: question.question,
      answer: question.answer,
      category: question.category || '',
      difficulty: question.difficulty || '',
    });
    setEditingQuestion(question.id);
  };

  const cancelEdit = () => {
    setCurrentQuestion({
      question: '',
      answer: '',
      category: '',
      difficulty: '',
    });
    setEditingQuestion(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading pack...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Pack</Text>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.disabledButton]}
            onPress={savePack}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save'}
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

          <View style={styles.questionInputCard}>
            <Text style={styles.cardTitle}>
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </Text>
            
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
            
            <View style={styles.questionActions}>
              {editingQuestion && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={cancelEdit}
                >
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, editingQuestion ? styles.updateButton : styles.addButton]}
                onPress={addOrUpdateQuestion}
              >
                <Text style={styles.actionButtonText}>
                  {editingQuestion ? 'Update' : 'Add'} Question
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.questionsListCard}>
            <Text style={styles.cardTitle}>Questions ({questions.length})</Text>
            
            {questions.length === 0 ? (
              <Text style={styles.emptyText}>No questions in this pack</Text>
            ) : (
              questions.map((question, index) => (
                <View key={question.id} style={styles.questionItem}>
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionNumber}>Q{index + 1}</Text>
                    <View style={styles.questionActions}>
                      <TouchableOpacity
                        style={[styles.miniActionButton, styles.editMiniButton]}
                        onPress={() => editQuestion(question)}
                      >
                        <Text style={styles.miniActionButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.miniActionButton, styles.deleteMiniButton]}
                        onPress={() => deleteQuestion(question.id)}
                      >
                        <Text style={styles.miniActionButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#cbd5e1',
    marginTop: 16,
    fontSize: 16,
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
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: '#64748b',
  },
  saveButtonText: {
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
  questionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#10b981',
  },
  updateButton: {
    backgroundColor: '#f59e0b',
  },
  cancelButton: {
    backgroundColor: '#64748b',
  },
  actionButtonText: {
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
  miniActionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  editMiniButton: {
    backgroundColor: '#2563eb',
  },
  deleteMiniButton: {
    backgroundColor: '#ef4444',
  },
  miniActionButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
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

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { QuestionPackManager } from '../services/questionPackManager';
import { QuestionPack } from '../types/index';
import { RootStackParamList } from '../navigation/MainNavigator';

type QuestionPackListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'QuestionPackList'>;

export const QuestionPackListScreen: React.FC = () => {
  const navigation = useNavigation<QuestionPackListNavigationProp>();
  const [packs, setPacks] = useState<QuestionPack[]>([]);
  const [filteredPacks, setFilteredPacks] = useState<QuestionPack[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [packManager] = useState(() => new QuestionPackManager());

  useEffect(() => {
    loadPacks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPacks(packs);
    } else {
      searchPacks(searchQuery);
    }
  }, [searchQuery, packs]);

  const loadPacks = async () => {
    try {
      const allPacks = await packManager.getAllPacks();
      setPacks(allPacks);
      setFilteredPacks(allPacks);
    } catch (error) {
      console.error('Failed to load packs:', error);
      Alert.alert('Error', 'Failed to load question packs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const searchPacks = async (query: string) => {
    try {
      if (query.trim() === '') {
        setFilteredPacks(packs);
      } else {
        const searchResults = await packManager.searchPacks(query);
        setFilteredPacks(searchResults);
      }
    } catch (error) {
      console.error('Failed to search packs:', error);
    }
  };

  const handleDeletePack = (pack: QuestionPack) => {
    Alert.alert(
      'Delete Pack',
      `Are you sure you want to delete "${pack.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await packManager.deletePack(pack.id);
              loadPacks();
            } catch (error) {
              console.error('Failed to delete pack:', error);
              Alert.alert('Error', 'Failed to delete pack');
            }
          }
        }
      ]
    );
  };

  const handleExportPack = async (pack: QuestionPack) => {
    try {
      const exportData = await packManager.exportPack(pack.id);
      // In a real app, you'd use Sharing library or save to file
      // For now, we'll show the JSON in an alert
      Alert.alert(
        'Export Pack',
        `Pack "${pack.name}" exported successfully!\n\nIn a production app, this would be saved as a file or shared.`,
        [{ text: 'OK' }]
      );
      console.log('Export data:', JSON.stringify(exportData, null, 2));
    } catch (error) {
      console.error('Failed to export pack:', error);
      Alert.alert('Error', 'Failed to export pack');
    }
  };

  const handlePlayPack = (pack: QuestionPack) => {
    // Navigate to trivia screen with pack selection
    // This would require updating the trivia screens to accept pack IDs
    Alert.alert(
      'Play Pack',
      `Starting game with "${pack.name}" pack (${pack.questionCount} questions)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Play',
          onPress: () => {
            // Navigate to trivia with pack ID
            // navigation.navigate('Trivia', { packId: pack.id });
            Alert.alert('Coming Soon', 'Pack-specific gameplay will be available soon!');
          }
        }
      ]
    );
  };

  const renderPackItem = ({ item }: { item: QuestionPack }) => (
    <View style={styles.packCard}>
      <View style={styles.packHeader}>
        <Text style={styles.packName}>{item.name}</Text>
        <Text style={styles.questionCount}>{item.questionCount} questions</Text>
      </View>
      
      {item.description && (
        <Text style={styles.packDescription}>{item.description}</Text>
      )}
      
      <View style={styles.packMeta}>
        {item.author && <Text style={styles.metaText}>By: {item.author}</Text>}
        {item.category && <Text style={styles.metaText}>Category: {item.category}</Text>}
        {item.difficulty && <Text style={styles.metaText}>Difficulty: {item.difficulty}</Text>}
      </View>

      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.packActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.playButton]}
          onPress={() => handlePlayPack(item)}
        >
          <Text style={styles.actionButtonText}>Play</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('QuestionPackEditor', { packId: item.id })}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={() => handleExportPack(item)}
        >
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePack(item)}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading question packs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Question Packs</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateQuestionPack')}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search packs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {filteredPacks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {searchQuery.trim() === '' 
              ? 'No question packs found. Create your first pack!' 
              : 'No packs match your search.'}
          </Text>
          {searchQuery.trim() === '' && (
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => navigation.navigate('CreateQuestionPack')}
            >
              <Text style={styles.createFirstButtonText}>Create Your First Pack</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredPacks}
          renderItem={renderPackItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadPacks();
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#2563eb',
    borderRadius: 999,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  packCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  packHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  packName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
  },
  questionCount: {
    fontSize: 14,
    color: '#64b5f6',
    fontWeight: '600',
  },
  packDescription: {
    fontSize: 14,
    color: '#cbd5e1',
    marginBottom: 12,
    lineHeight: 20,
  },
  packMeta: {
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  packActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#10b981',
  },
  editButton: {
    backgroundColor: '#2563eb',
  },
  exportButton: {
    backgroundColor: '#f59e0b',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { Theme, ThemeColors, ThemeCustomization } from '../types/theme';
import { RootStackParamList } from '../navigation/MainNavigator';

type ThemeEditorNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ThemeEditor'>;

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e', '#000000', '#64748b', '#ffffff',
  ];

  return (
    <View style={styles.colorPickerContainer}>
      <Text style={styles.colorLabel}>{label}</Text>
      <View style={styles.colorInputRow}>
        <View style={[styles.colorPreview, { backgroundColor: value }]} />
        <TextInput
          style={styles.colorInput}
          value={value}
          onChangeText={onChange}
          placeholder="#000000"
          placeholderTextColor="#94a3b8"
        />
      </View>
      <View style={styles.presetColors}>
        {presetColors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.presetColor, { backgroundColor: color }]}
            onPress={() => onChange(color)}
          />
        ))}
      </View>
    </View>
  );
};

export const ThemeEditorScreen: React.FC = () => {
  const navigation = useNavigation<ThemeEditorNavigationProp>();
  const { currentTheme, createCustomTheme, updateCustomTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'spacing' | 'borders'>('colors');
  const [isEditing, setIsEditing] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  
  // Theme properties
  const [themeName, setThemeName] = useState('');
  const [themeDescription, setThemeDescription] = useState('');
  const [isDark, setIsDark] = useState(false);
  
  // Colors
  const [colors, setColors] = useState<ThemeColors>(currentTheme.colors);
  
  // Fonts
  const [fontSizes, setFontSizes] = useState(currentTheme.fonts);
  
  // Spacing
  const [spacing, setSpacing] = useState(currentTheme.spacing);
  
  // Border radius
  const [borderRadius, setBorderRadius] = useState(currentTheme.borderRadius);

  useEffect(() => {
    // Reset to current theme when component mounts
    setColors(currentTheme.colors);
    setFontSizes(currentTheme.fonts);
    setSpacing(currentTheme.spacing);
    setBorderRadius(currentTheme.borderRadius);
    setIsDark(currentTheme.isDark);
  }, [currentTheme]);

  const resetToCurrentTheme = () => {
    setColors(currentTheme.colors);
    setFontSizes(currentTheme.fonts);
    setSpacing(currentTheme.spacing);
    setBorderRadius(currentTheme.borderRadius);
    setIsDark(currentTheme.isDark);
    setThemeName('');
    setThemeDescription('');
    setIsEditing(false);
    setEditingThemeId(null);
  };

  const saveTheme = async () => {
    if (!themeName.trim()) {
      Alert.alert('Error', 'Theme name is required');
      return;
    }

    setLoading(true);
    
    try {
      const themeData = {
        name: themeName.trim(),
        description: themeDescription.trim() || undefined,
        colors,
        fonts: fontSizes,
        spacing,
        borderRadius,
        shadows: currentTheme.shadows,
        isDark,
        isCustom: true,
      };

      if (isEditing && editingThemeId) {
        await updateCustomTheme(editingThemeId, { ...themeData, updatedAt: Date.now() });
        Alert.alert('Success', 'Theme updated successfully!');
      } else {
        const themeId = await createCustomTheme(themeData);
        Alert.alert('Success', 'Theme created successfully!');
      }

      resetToCurrentTheme();
    } catch (error) {
      console.error('Failed to save theme:', error);
      Alert.alert('Error', 'Failed to save theme');
    } finally {
      setLoading(false);
    }
  };

  const exportCurrentTheme = async () => {
    try {
      // In a real app, this would use Sharing library
      Alert.alert(
        'Export Theme',
        'Theme exported successfully! (In a production app, this would save/share the file)',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to export theme:', error);
      Alert.alert('Error', 'Failed to export theme');
    }
  };

  const renderColorTab = () => (
    <View style={styles.tabContent}>
      <ColorPicker
        label="Primary"
        value={colors.primary}
        onChange={(color) => setColors({ ...colors, primary: color })}
      />
      <ColorPicker
        label="Secondary"
        value={colors.secondary}
        onChange={(color) => setColors({ ...colors, secondary: color })}
      />
      <ColorPicker
        label="Background"
        value={colors.background}
        onChange={(color) => setColors({ ...colors, background: color })}
      />
      <ColorPicker
        label="Surface"
        value={colors.surface}
        onChange={(color) => setColors({ ...colors, surface: color })}
      />
      <ColorPicker
        label="Text"
        value={colors.text}
        onChange={(color) => setColors({ ...colors, text: color })}
      />
      <ColorPicker
        label="Success"
        value={colors.success}
        onChange={(color) => setColors({ ...colors, success: color })}
      />
      <ColorPicker
        label="Warning"
        value={colors.warning}
        onChange={(color) => setColors({ ...colors, warning: color })}
      />
      <ColorPicker
        label="Error"
        value={colors.error}
        onChange={(color) => setColors({ ...colors, error: color })}
      />
    </View>
  );

  const renderFontsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Font Sizes</Text>
      {[
        { key: 'xs', label: 'Extra Small' },
        { key: 'sm', label: 'Small' },
        { key: 'base', label: 'Base' },
        { key: 'lg', label: 'Large' },
        { key: 'xl', label: 'Extra Large' },
        { key: 'xxl', label: '2X Large' },
        { key: 'xxxl', label: '3X Large' },
      ].map(({ key, label }) => (
        <View key={key} style={styles.inputRow}>
          <Text style={styles.inputLabel}>{label}</Text>
          <TextInput
            style={styles.numericInput}
            value={fontSizes[key as keyof typeof fontSizes].toString()}
            onChangeText={(value) => {
              const num = parseInt(value) || 0;
              setFontSizes({ ...fontSizes, [key]: num });
            }}
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
        </View>
      ))}
    </View>
  );

  const renderSpacingTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Spacing Values</Text>
      {[
        { key: 'xs', label: 'Extra Small' },
        { key: 'sm', label: 'Small' },
        { key: 'md', label: 'Medium' },
        { key: 'lg', label: 'Large' },
        { key: 'xl', label: 'Extra Large' },
        { key: 'xxl', label: '2X Large' },
      ].map(({ key, label }) => (
        <View key={key} style={styles.inputRow}>
          <Text style={styles.inputLabel}>{label}</Text>
          <TextInput
            style={styles.numericInput}
            value={spacing[key as keyof typeof spacing].toString()}
            onChangeText={(value) => {
              const num = parseInt(value) || 0;
              setSpacing({ ...spacing, [key]: num });
            }}
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
        </View>
      ))}
    </View>
  );

  const renderBordersTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Border Radius</Text>
      {[
        { key: 'none', label: 'None' },
        { key: 'sm', label: 'Small' },
        { key: 'md', label: 'Medium' },
        { key: 'lg', label: 'Large' },
        { key: 'xl', label: 'Extra Large' },
        { key: 'full', label: 'Full' },
      ].map(({ key, label }) => (
        <View key={key} style={styles.inputRow}>
          <Text style={styles.inputLabel}>{label}</Text>
          <TextInput
            style={styles.numericInput}
            value={borderRadius[key as keyof typeof borderRadius].toString()}
            onChangeText={(value) => {
              const num = parseInt(value) || 0;
              setBorderRadius({ ...borderRadius, [key]: num });
            }}
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
        </View>
      ))}
    </View>
  );

  const renderPreview = () => (
    <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
      <Text style={[styles.previewTitle, { color: colors.text }]}>Preview</Text>
      <View style={[styles.previewButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.previewButtonText, { color: colors.textInverse }]}>Primary Button</Text>
      </View>
      <View style={[styles.previewButton, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.previewButtonText, { color: colors.textInverse }]}>Secondary Button</Text>
      </View>
      <View style={[styles.previewBox, { backgroundColor: colors.background, borderColor: colors.surfaceBorder }]}>
        <Text style={[styles.previewText, { color: colors.text }]}>Sample text content</Text>
        <Text style={[styles.previewSubText, { color: colors.textSecondary }]}>Secondary text</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.header, { borderBottomColor: colors.surfaceBorder }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Theme Editor</Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={saveTheme}
            disabled={loading}
          >
            <Text style={[styles.actionButtonText, { color: colors.textInverse }]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme Details</Text>
            
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.surfaceBorder, color: colors.text }]}
              placeholder="Theme Name"
              value={themeName}
              onChangeText={setThemeName}
              placeholderTextColor={colors.textSecondary}
            />
            
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, borderColor: colors.surfaceBorder, color: colors.text }]}
              placeholder="Description (optional)"
              value={themeDescription}
              onChangeText={setThemeDescription}
              placeholderTextColor={colors.textSecondary}
              multiline
            />
            
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: colors.text }]}>Dark Theme</Text>
              <Switch
                value={isDark}
                onValueChange={setIsDark}
                trackColor={{ false: colors.surfaceBorder, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </View>

          <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <View style={styles.tabButtons}>
              {[
                { key: 'colors', label: 'Colors' },
                { key: 'fonts', label: 'Fonts' },
                { key: 'spacing', label: 'Spacing' },
                { key: 'borders', label: 'Borders' },
              ].map(({ key, label }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.tabButton,
                    activeTab === key && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setActiveTab(key as any)}
                >
                  <Text style={[
                    styles.tabButtonText,
                    { color: activeTab === key ? colors.textInverse : colors.text }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {activeTab === 'colors' && renderColorTab()}
          {activeTab === 'fonts' && renderFontsTab()}
          {activeTab === 'spacing' && renderSpacingTab()}
          {activeTab === 'borders' && renderBordersTab()}

          {renderPreview()}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.secondaryActionButton, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              onPress={resetToCurrentTheme}
            >
              <Text style={[styles.secondaryActionButtonText, { color: colors.text }]}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondaryActionButton, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}
              onPress={exportCurrentTheme}
            >
              <Text style={[styles.secondaryActionButtonText, { color: colors.text }]}>Export</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  backButton: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionButtonText: {
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
  detailsCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabsContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  tabButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    marginBottom: 16,
  },
  colorPickerContainer: {
    marginBottom: 20,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  colorInput: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  presetColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetColor: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  numericInput: {
    width: 80,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    textAlign: 'center',
  },
  previewCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  previewButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewBox: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  previewText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewSubText: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryActionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

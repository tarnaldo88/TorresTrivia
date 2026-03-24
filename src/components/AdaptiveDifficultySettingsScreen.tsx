import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ImageBackground,
    ScrollView,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdaptiveDifficulty, AdaptiveDifficultySettings } from '../services/adaptiveDifficulty';
import { ProgressiveDifficultyManager, ProgressiveDifficultyCurve } from '../services/progressiveDifficultyManager';
import { RootStackParamList } from '../navigation/MainNavigator';

type SettingsNavigationProp = NativeStackNavigationProp<any>;

interface AdaptiveDifficultySettingsScreenProps {
    onSettingsChange?: (settings: AdaptiveDifficultySettings) => void;
}

export const AdaptiveDifficultySettingsScreen: React.FC<AdaptiveDifficultySettingsScreenProps> = ({
    onSettingsChange,
}) => {
    const navigation = useNavigation<SettingsNavigationProp>();
    
    // Adaptive difficulty settings
    const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveDifficultySettings>({
        enabled: true,
        difficultySensitivity: 0.5,
        minimumQuestionsBeforeAdjustment: 5,
        targetSuccessRate: 0.7,
        enableProgressiveDifficulty: true,
        progressiveRate: 0.15,
        categoryAdaptation: true,
        timeBasedAdaptation: true,
    });

    // Progressive difficulty settings
    const [progressiveCurve, setProgressiveCurve] = useState<ProgressiveDifficultyCurve>({
        curveType: 'LINEAR',
        baseDifficulty: 'Easy',
        maxDifficulty: 'Expert',
        roundsToMax: 10,
        adaptiveAdjustment: true,
    });

    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadCurrentSettings();
    }, []);

    const loadCurrentSettings = () => {
        // In a real implementation, these would be loaded from storage
        // For now, we'll use the defaults
    };

    const updateAdaptiveSetting = <K extends keyof AdaptiveDifficultySettings>(
        key: K,
        value: AdaptiveDifficultySettings[K]
    ) => {
        setAdaptiveSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const updateProgressiveSetting = <K extends keyof ProgressiveDifficultyCurve>(
        key: K,
        value: ProgressiveDifficultyCurve[K]
    ) => {
        setProgressiveCurve(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const saveSettings = () => {
        // Save settings to storage
        if (onSettingsChange) {
            onSettingsChange(adaptiveSettings);
        }
        setHasChanges(false);
        
        // Navigate back
        navigation.goBack();
    };

    const resetToDefaults = () => {
        setAdaptiveSettings({
            enabled: true,
            difficultySensitivity: 0.5,
            minimumQuestionsBeforeAdjustment: 5,
            targetSuccessRate: 0.7,
            enableProgressiveDifficulty: true,
            progressiveRate: 0.15,
            categoryAdaptation: true,
            timeBasedAdaptation: true,
        });

        setProgressiveCurve({
            curveType: 'LINEAR',
            baseDifficulty: 'Easy',
            maxDifficulty: 'Expert',
            roundsToMax: 10,
            adaptiveAdjustment: true,
        });

        setHasChanges(true);
    };

    const getCurveTypeDescription = (type: string): string => {
        switch (type) {
            case 'LINEAR':
                return 'Difficulty increases steadily';
            case 'EXPONENTIAL':
                return 'Difficulty increases faster over time';
            case 'LOGARITHMIC':
                return 'Difficulty increases quickly then levels off';
            case 'STEP_FUNCTION':
                return 'Difficulty increases in steps';
            default:
                return 'Custom difficulty curve';
        }
    };

    return (
        <ImageBackground 
            source={require('../assets/torresTrivia.png')}
            style={styles.background}
        >
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        disabled={hasChanges}
                    >
                        <Text style={styles.backButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Adaptive Difficulty</Text>
                    <TouchableOpacity
                        style={[styles.saveButton, hasChanges && styles.saveButtonActive]}
                        onPress={saveSettings}
                        disabled={!hasChanges}
                    >
                        <Text style={[styles.backButtonText, hasChanges && styles.saveButtonTextActive]}>
                            Save
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Main Adaptive Difficulty Settings */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Adaptive Difficulty</Text>
                        
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Enable Adaptive Difficulty</Text>
                                <Text style={styles.settingDescription}>Adjust difficulty based on performance</Text>
                            </View>
                            <Switch
                                value={adaptiveSettings.enabled}
                                onValueChange={(value) => updateAdaptiveSetting('enabled', value)}
                                trackColor={{ false: '#767577', true: '#007AFF' }}
                                thumbColor={adaptiveSettings.enabled ? '#ffffff' : '#f4f3f4'}
                            />
                        </View>

                        {adaptiveSettings.enabled && (
                            <>
                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Difficulty Sensitivity</Text>
                                        <Text style={styles.settingDescription}>
                                            How quickly difficulty changes ({adaptiveSettings.difficultySensitivity.toFixed(2)})
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.decrementButton}
                                        onPress={() => {
                                            const newValue = Math.max(0.1, adaptiveSettings.difficultySensitivity - 0.1);
                                            updateAdaptiveSetting('difficultySensitivity', newValue);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.valueText}>{adaptiveSettings.difficultySensitivity.toFixed(2)}</Text>
                                    <TouchableOpacity
                                        style={styles.incrementButton}
                                        onPress={() => {
                                            const newValue = Math.min(1.0, adaptiveSettings.difficultySensitivity + 0.1);
                                            updateAdaptiveSetting('difficultySensitivity', newValue);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>+</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Minimum Questions</Text>
                                        <Text style={styles.settingDescription}>
                                            Questions before adjustment ({adaptiveSettings.minimumQuestionsBeforeAdjustment})
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.decrementButton}
                                        onPress={() => {
                                            const newValue = Math.max(3, adaptiveSettings.minimumQuestionsBeforeAdjustment - 1);
                                            updateAdaptiveSetting('minimumQuestionsBeforeAdjustment', newValue);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.valueText}>{adaptiveSettings.minimumQuestionsBeforeAdjustment}</Text>
                                    <TouchableOpacity
                                        style={styles.incrementButton}
                                        onPress={() => {
                                            const newValue = Math.min(15, adaptiveSettings.minimumQuestionsBeforeAdjustment + 1);
                                            updateAdaptiveSetting('minimumQuestionsBeforeAdjustment', newValue);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>+</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Target Success Rate</Text>
                                        <Text style={styles.settingDescription}>
                                            Ideal success rate ({Math.round(adaptiveSettings.targetSuccessRate * 100)}%)
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.decrementButton}
                                        onPress={() => {
                                            const newValue = Math.max(0.3, adaptiveSettings.targetSuccessRate - 0.1);
                                            updateAdaptiveSetting('targetSuccessRate', newValue);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.valueText}>{Math.round(adaptiveSettings.targetSuccessRate * 100)}%</Text>
                                    <TouchableOpacity
                                        style={styles.incrementButton}
                                        onPress={() => {
                                            const newValue = Math.min(0.9, adaptiveSettings.targetSuccessRate + 0.1);
                                            updateAdaptiveSetting('targetSuccessRate', newValue);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>+</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Category Adaptation</Text>
                                        <Text style={styles.settingDescription}>Adapt per category performance</Text>
                                    </View>
                                    <Switch
                                        value={adaptiveSettings.categoryAdaptation}
                                        onValueChange={(value) => updateAdaptiveSetting('categoryAdaptation', value)}
                                        trackColor={{ false: '#767577', true: '#007AFF' }}
                                        thumbColor={adaptiveSettings.categoryAdaptation ? '#ffffff' : '#f4f3f4'}
                                    />
                                </View>

                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Time-Based Adaptation</Text>
                                        <Text style={styles.settingDescription}>Consider response time</Text>
                                    </View>
                                    <Switch
                                        value={adaptiveSettings.timeBasedAdaptation}
                                        onValueChange={(value) => updateAdaptiveSetting('timeBasedAdaptation', value)}
                                        trackColor={{ false: '#767577', true: '#007AFF' }}
                                        thumbColor={adaptiveSettings.timeBasedAdaptation ? '#ffffff' : '#f4f3f4'}
                                    />
                                </View>
                            </>
                        )}
                    </View>

                    {/* Progressive Difficulty Settings */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Progressive Difficulty</Text>
                        
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Enable Progressive Difficulty</Text>
                                <Text style={styles.settingDescription}>Difficulty increases across rounds</Text>
                            </View>
                            <Switch
                                value={adaptiveSettings.enableProgressiveDifficulty}
                                onValueChange={(value) => updateAdaptiveSetting('enableProgressiveDifficulty', value)}
                                trackColor={{ false: '#767577', true: '#007AFF' }}
                                thumbColor={adaptiveSettings.enableProgressiveDifficulty ? '#ffffff' : '#f4f3f4'}
                            />
                        </View>

                        {adaptiveSettings.enableProgressiveDifficulty && (
                            <>
                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Curve Type</Text>
                                        <Text style={styles.settingDescription}>
                                            {getCurveTypeDescription(progressiveCurve.curveType)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.curveTypeButtons}>
                                    {(['LINEAR', 'EXPONENTIAL', 'LOGARITHMIC', 'STEP_FUNCTION'] as const).map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            style={[
                                                styles.curveTypeButton,
                                                progressiveCurve.curveType === type && styles.curveTypeButtonActive
                                            ]}
                                            onPress={() => updateProgressiveSetting('curveType', type)}
                                        >
                                            <Text style={[
                                                styles.curveTypeButtonText,
                                                progressiveCurve.curveType === type && styles.curveTypeButtonTextActive
                                            ]}>
                                                {type.charAt(0) + type.slice(1).toLowerCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Starting Difficulty</Text>
                                        <Text style={styles.settingDescription}>
                                            First round difficulty
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.difficultyButtons}>
                                    {(['Easy', 'Medium', 'Hard', 'Expert'] as const).map((difficulty) => (
                                        <TouchableOpacity
                                            key={difficulty}
                                            style={[
                                                styles.difficultyButton,
                                                progressiveCurve.baseDifficulty === difficulty && styles.difficultyButtonActive
                                            ]}
                                            onPress={() => updateProgressiveSetting('baseDifficulty', difficulty)}
                                        >
                                            <Text style={[
                                                styles.difficultyButtonText,
                                                progressiveCurve.baseDifficulty === difficulty && styles.difficultyButtonTextActive
                                            ]}>
                                                {difficulty}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Maximum Difficulty</Text>
                                        <Text style={styles.settingDescription}>
                                            Final round difficulty
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.difficultyButtons}>
                                    {(['Easy', 'Medium', 'Hard', 'Expert'] as const).map((difficulty) => (
                                        <TouchableOpacity
                                            key={difficulty}
                                            style={[
                                                styles.difficultyButton,
                                                progressiveCurve.maxDifficulty === difficulty && styles.difficultyButtonActive
                                            ]}
                                            onPress={() => updateProgressiveSetting('maxDifficulty', difficulty)}
                                        >
                                            <Text style={[
                                                styles.difficultyButtonText,
                                                progressiveCurve.maxDifficulty === difficulty && styles.difficultyButtonTextActive
                                            ]}>
                                                {difficulty}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Rounds to Max Difficulty</Text>
                                        <Text style={styles.settingDescription}>
                                            ({progressiveCurve.roundsToMax} rounds)
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={styles.decrementButton}
                                        onPress={() => {
                                            const newValue = Math.max(3, progressiveCurve.roundsToMax - 1);
                                            updateProgressiveSetting('roundsToMax', newValue);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.valueText}>{progressiveCurve.roundsToMax}</Text>
                                    <TouchableOpacity
                                        style={styles.incrementButton}
                                        onPress={() => {
                                            const newValue = Math.min(20, progressiveCurve.roundsToMax + 1);
                                            updateProgressiveSetting('roundsToMax', newValue);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>+</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Adaptive Adjustment</Text>
                                        <Text style={styles.settingDescription}>
                                            Adjust based on performance
                                        </Text>
                                    </View>
                                    <Switch
                                        value={progressiveCurve.adaptiveAdjustment}
                                        onValueChange={(value) => updateProgressiveSetting('adaptiveAdjustment', value)}
                                        trackColor={{ false: '#767577', true: '#007AFF' }}
                                        thumbColor={progressiveCurve.adaptiveAdjustment ? '#ffffff' : '#f4f3f4'}
                                    />
                                </View>
                            </>
                        )}
                    </View>

                    {/* Reset Button */}
                    <View style={styles.section}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={resetToDefaults}
                        >
                            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 999,
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    saveButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        borderRadius: 999,
        paddingVertical: 9,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    saveButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    backButtonText: {
        color: '#f8fafc',
        fontSize: 14,
        fontWeight: '700',
    },
    saveButtonTextActive: {
        color: '#ffffff',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#cccccc',
        lineHeight: 18,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 20,
    },
    decrementButton: {
        backgroundColor: '#dc3545',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    incrementButton: {
        backgroundColor: '#28a745',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    valueText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        minWidth: 60,
        textAlign: 'center',
    },
    curveTypeButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    curveTypeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    curveTypeButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    curveTypeButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    curveTypeButtonTextActive: {
        color: '#ffffff',
    },
    difficultyButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    difficultyButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        minWidth: 70,
        alignItems: 'center',
    },
    difficultyButtonActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
    },
    difficultyButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    difficultyButtonTextActive: {
        color: '#ffffff',
    },
    resetButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});

import { QuestionPackManager } from './questionPackManager';
import { ExportableQuestionPack } from '../types/index';

/**
 * PackImportExport handles importing and exporting question packs
 */
export class PackImportExport {
  private packManager: QuestionPackManager;

  constructor() {
    this.packManager = new QuestionPackManager();
  }

  /**
   * Export a pack to JSON string
   */
  async exportPackToJson(packId: string): Promise<string> {
    try {
      const exportData = await this.packManager.exportPack(packId);
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export pack to JSON:', error);
      throw error;
    }
  }

  /**
   * Export a pack to CSV format
   */
  async exportPackToCsv(packId: string): Promise<string> {
    try {
      const exportData = await this.packManager.exportPack(packId);
      
      // Create CSV header
      const headers = ['Question', 'Answer', 'Category', 'Difficulty'];
      
      // Create CSV rows
      const rows = exportData.questions.map(q => [
        `"${this.escapeCsvField(q.question)}"`,
        `"${this.escapeCsvField(q.answer)}"`,
        `"${this.escapeCsvField(q.category || '')}"`,
        `"${this.escapeCsvField(q.difficulty || '')}"`
      ]);
      
      // Combine header and rows
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      
      // Add metadata as comments at the top
      const metadata = [
        `# Pack Name: ${exportData.name}`,
        `# Description: ${exportData.description || ''}`,
        `# Author: ${exportData.author || ''}`,
        `# Category: ${exportData.category || ''}`,
        `# Difficulty: ${exportData.difficulty || ''}`,
        `# Tags: ${exportData.tags?.join(', ') || ''}`,
        `# Questions: ${exportData.questions.length}`,
        `# Exported: ${new Date(exportData.exportedAt).toISOString()}`,
        `# Version: ${exportData.version}`,
        ''
      ];
      
      return metadata.join('\n') + csvContent;
    } catch (error) {
      console.error('Failed to export pack to CSV:', error);
      throw error;
    }
  }

  /**
   * Import a pack from JSON string
   */
  async importPackFromJson(jsonString: string): Promise<string> {
    try {
      const exportData: ExportableQuestionPack = JSON.parse(jsonString);
      
      // Validate the structure
      if (!exportData.name || !exportData.questions || !Array.isArray(exportData.questions)) {
        throw new Error('Invalid pack format');
      }
      
      if (exportData.questions.length === 0) {
        throw new Error('Pack must contain at least one question');
      }
      
      // Validate each question
      for (const question of exportData.questions) {
        if (!question.question || !question.answer) {
          throw new Error('All questions must have both question and answer');
        }
      }
      
      return await this.packManager.importPack(exportData);
    } catch (error) {
      console.error('Failed to import pack from JSON:', error);
      throw error;
    }
  }

  /**
   * Import a pack from CSV string
   */
  async importPackFromCsv(csvString: string, packName?: string): Promise<string> {
    try {
      const lines = csvString.split('\n');
      const questions: { question: string; answer: string; category?: string; difficulty?: string }[] = [];
      let metadata: Partial<ExportableQuestionPack> = {};
      
      // Parse metadata from comments
      for (const line of lines) {
        if (line.startsWith('#')) {
          const match = line.match(/^#\s*(.+?):\s*(.+)$/);
          if (match) {
            const [, key, value] = match;
            switch (key.toLowerCase()) {
              case 'pack name':
                metadata.name = value;
                break;
              case 'description':
                metadata.description = value;
                break;
              case 'author':
                metadata.author = value;
                break;
              case 'category':
                metadata.category = value;
                break;
              case 'difficulty':
                metadata.difficulty = value;
                break;
              case 'tags':
                metadata.tags = value.split(',').map(tag => tag.trim()).filter(tag => tag);
                break;
            }
          }
        } else if (line.trim() && !line.startsWith('#')) {
          // Parse CSV data
          const parsedLine = this.parseCsvLine(line);
          if (parsedLine.length >= 2) {
            questions.push({
              question: this.unescapeCsvField(parsedLine[0]),
              answer: this.unescapeCsvField(parsedLine[1]),
              category: parsedLine[2] ? this.unescapeCsvField(parsedLine[2]) : undefined,
              difficulty: parsedLine[3] ? this.unescapeCsvField(parsedLine[3]) : undefined,
            });
          }
        }
      }
      
      if (questions.length === 0) {
        throw new Error('No valid questions found in CSV');
      }
      
      // Create exportable pack
      const exportData: ExportableQuestionPack = {
        name: packName || metadata.name || 'Imported Pack',
        description: metadata.description,
        author: metadata.author,
        category: metadata.category,
        difficulty: metadata.difficulty,
        tags: metadata.tags,
        questions,
        version: '1.0.0',
        exportedAt: Date.now(),
      };
      
      return await this.packManager.importPack(exportData);
    } catch (error) {
      console.error('Failed to import pack from CSV:', error);
      throw error;
    }
  }

  /**
   * Validate pack data before import
   */
  validatePackData(data: ExportableQuestionPack): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Pack name is required');
    }
    
    if (!data.questions || data.questions.length === 0) {
      errors.push('At least one question is required');
    } else {
      data.questions.forEach((question, index) => {
        if (!question.question || question.question.trim().length === 0) {
          errors.push(`Question ${index + 1}: Question text is required`);
        }
        if (!question.answer || question.answer.trim().length === 0) {
          errors.push(`Question ${index + 1}: Answer is required`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Escape CSV field to handle commas and quotes
   */
  private escapeCsvField(field: string): string {
    return field.replace(/"/g, '""');
  }

  /**
   * Unescape CSV field
   */
  private unescapeCsvField(field: string): string {
    return field.replace(/""/g, '"');
  }

  /**
   * Parse a CSV line handling quoted fields
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    
    return result;
  }

  /**
   * Generate a sample pack for testing
   */
  generateSamplePack(): ExportableQuestionPack {
    return {
      name: 'Sample Trivia Pack',
      description: 'A sample pack to demonstrate import/export functionality',
      author: 'TorresTrivia',
      category: 'General Knowledge',
      difficulty: 'Mixed',
      tags: ['sample', 'demo', 'test'],
      questions: [
        {
          question: 'What is the capital of France?',
          answer: 'Paris',
          category: 'Geography',
          difficulty: 'Easy'
        },
        {
          question: 'Who painted the Mona Lisa?',
          answer: 'Leonardo da Vinci',
          category: 'Art',
          difficulty: 'Medium'
        },
        {
          question: 'What is the largest planet in our solar system?',
          answer: 'Jupiter',
          category: 'Science',
          difficulty: 'Easy'
        }
      ],
      version: '1.0.0',
      exportedAt: Date.now()
    };
  }
}

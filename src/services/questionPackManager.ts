import { Database } from './database';
import { QuestionPack, PackQuestion, ExportableQuestionPack } from '../types/index';

/**
 * QuestionPackManager manages custom question packs and their questions
 */
export class QuestionPackManager {
  /**
   * Create a new question pack
   */
  async createPack(pack: Omit<QuestionPack, 'id' | 'questionCount' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const db = Database.getInstance();
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const now = Date.now();
      
      await db.runAsync(
        `INSERT INTO question_packs (id, name, description, author, category, difficulty, question_count, is_public, created_at, updated_at, tags) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          pack.name,
          pack.description || null,
          pack.author || null,
          pack.category || null,
          pack.difficulty || null,
          0, // question_count starts at 0
          pack.isPublic ? 1 : 0,
          now,
          now,
          pack.tags ? JSON.stringify(pack.tags) : null
        ]
      );

      console.log(`Question pack created successfully with id: ${id}`);
      return id;
    } catch (error) {
      console.error('Failed to create question pack:', error);
      throw error;
    }
  }

  /**
   * Get all question packs
   */
  async getAllPacks(): Promise<QuestionPack[]> {
    try {
      const db = Database.getInstance();
      const rows = await db.getAllAsync(
        'SELECT * FROM question_packs ORDER BY updated_at DESC'
      );

      return rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        author: row.author,
        category: row.category,
        difficulty: row.difficulty,
        questionCount: row.question_count,
        isPublic: row.is_public === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        tags: row.tags ? JSON.parse(row.tags) : undefined
      }));
    } catch (error) {
      console.error('Failed to get question packs:', error);
      throw error;
    }
  }

  /**
   * Get a specific question pack by ID
   */
  async getPackById(id: string): Promise<QuestionPack | null> {
    try {
      const db = Database.getInstance();
      const row = await db.getFirstAsync(
        'SELECT * FROM question_packs WHERE id = ?',
        [id]
      );

      if (!row) return null;

      return {
        id: (row as any).id,
        name: (row as any).name,
        description: (row as any).description,
        author: (row as any).author,
        category: (row as any).category,
        difficulty: (row as any).difficulty,
        questionCount: (row as any).question_count,
        isPublic: (row as any).is_public === 1,
        createdAt: (row as any).created_at,
        updatedAt: (row as any).updated_at,
        tags: (row as any).tags ? JSON.parse((row as any).tags) : undefined
      };
    } catch (error) {
      console.error(`Failed to get pack by id ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a question pack
   */
  async updatePack(id: string, updates: Partial<QuestionPack>): Promise<void> {
    try {
      const db = Database.getInstance();
      const now = Date.now();
      
      const setClause = [];
      const values = [];
      
      if (updates.name !== undefined) {
        setClause.push('name = ?');
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        setClause.push('description = ?');
        values.push(updates.description);
      }
      if (updates.author !== undefined) {
        setClause.push('author = ?');
        values.push(updates.author);
      }
      if (updates.category !== undefined) {
        setClause.push('category = ?');
        values.push(updates.category);
      }
      if (updates.difficulty !== undefined) {
        setClause.push('difficulty = ?');
        values.push(updates.difficulty);
      }
      if (updates.isPublic !== undefined) {
        setClause.push('is_public = ?');
        values.push(updates.isPublic ? 1 : 0);
      }
      if (updates.tags !== undefined) {
        setClause.push('tags = ?');
        values.push(JSON.stringify(updates.tags));
      }
      
      setClause.push('updated_at = ?');
      values.push(now);
      values.push(id);

      if (setClause.length > 1) { // Only if there are actual updates
        await db.runAsync(
          `UPDATE question_packs SET ${setClause.join(', ')} WHERE id = ?`,
          values
        );
      }

      console.log(`Question pack ${id} updated successfully`);
    } catch (error) {
      console.error(`Failed to update pack ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a question pack and all its questions
   */
  async deletePack(id: string): Promise<void> {
    try {
      const db = Database.getInstance();
      
      await db.withTransactionAsync(async () => {
        // Delete pack questions first (foreign key should handle this, but being explicit)
        await db.runAsync('DELETE FROM pack_questions WHERE pack_id = ?', [id]);
        // Delete the pack
        await db.runAsync('DELETE FROM question_packs WHERE id = ?', [id]);
      });

      console.log(`Question pack ${id} deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete pack ${id}:`, error);
      throw error;
    }
  }

  /**
   * Add a question to a pack
   */
  async addQuestionToPack(packId: string, question: Omit<PackQuestion, 'id' | 'packId' | 'orderIndex'>): Promise<string> {
    try {
      const db = Database.getInstance();
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Get the next order index
      const maxOrderResult = await db.getFirstAsync(
        'SELECT MAX(order_index) as max_order FROM pack_questions WHERE pack_id = ?',
        [packId]
      );
      const nextOrder = maxOrderResult ? ((maxOrderResult as any).max_order || 0) + 1 : 0;

      await db.withTransactionAsync(async () => {
        // Insert the question
        await db.runAsync(
          'INSERT INTO pack_questions (id, pack_id, question, answer, category, difficulty, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [id, packId, question.question, question.answer, question.category, question.difficulty, nextOrder]
        );

        // Update pack question count
        await db.runAsync(
          'UPDATE question_packs SET question_count = question_count + 1, updated_at = ? WHERE id = ?',
          [Date.now(), packId]
        );
      });

      console.log(`Question added to pack ${packId} with id: ${id}`);
      return id;
    } catch (error) {
      console.error(`Failed to add question to pack ${packId}:`, error);
      throw error;
    }
  }

  /**
   * Get all questions in a pack
   */
  async getPackQuestions(packId: string): Promise<PackQuestion[]> {
    try {
      const db = Database.getInstance();
      const rows = await db.getAllAsync(
        'SELECT * FROM pack_questions WHERE pack_id = ? ORDER BY order_index',
        [packId]
      );

      return rows.map((row: any) => ({
        id: row.id,
        packId: row.pack_id,
        question: row.question,
        answer: row.answer,
        category: row.category,
        difficulty: row.difficulty,
        orderIndex: row.order_index
      }));
    } catch (error) {
      console.error(`Failed to get questions for pack ${packId}:`, error);
      throw error;
    }
  }

  /**
   * Update a question in a pack
   */
  async updatePackQuestion(questionId: string, updates: Partial<PackQuestion>): Promise<void> {
    try {
      const db = Database.getInstance();
      
      const setClause = [];
      const values = [];
      
      if (updates.question !== undefined) {
        setClause.push('question = ?');
        values.push(updates.question);
      }
      if (updates.answer !== undefined) {
        setClause.push('answer = ?');
        values.push(updates.answer);
      }
      if (updates.category !== undefined) {
        setClause.push('category = ?');
        values.push(updates.category);
      }
      if (updates.difficulty !== undefined) {
        setClause.push('difficulty = ?');
        values.push(updates.difficulty);
      }
      
      values.push(questionId);

      if (setClause.length > 0) {
        await db.runAsync(
          `UPDATE pack_questions SET ${setClause.join(', ')} WHERE id = ?`,
          values
        );
        
        // Update pack's updated_at timestamp
        const question = await this.getPackQuestionById(questionId);
        if (question) {
          await db.runAsync(
            'UPDATE question_packs SET updated_at = ? WHERE id = ?',
            [Date.now(), question.packId]
          );
        }
      }

      console.log(`Pack question ${questionId} updated successfully`);
    } catch (error) {
      console.error(`Failed to update pack question ${questionId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a question from a pack
   */
  async deletePackQuestion(questionId: string): Promise<void> {
    try {
      const db = Database.getInstance();
      
      // Get the question to get the pack ID
      const question = await this.getPackQuestionById(questionId);
      if (!question) return;

      await db.withTransactionAsync(async () => {
        // Delete the question
        await db.runAsync('DELETE FROM pack_questions WHERE id = ?', [questionId]);
        
        // Update pack question count
        await db.runAsync(
          'UPDATE question_packs SET question_count = question_count - 1, updated_at = ? WHERE id = ?',
          [Date.now(), question.packId]
        );
      });

      console.log(`Pack question ${questionId} deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete pack question ${questionId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific pack question by ID
   */
  async getPackQuestionById(questionId: string): Promise<PackQuestion | null> {
    try {
      const db = Database.getInstance();
      const row = await db.getFirstAsync(
        'SELECT * FROM pack_questions WHERE id = ?',
        [questionId]
      );

      if (!row) return null;

      return {
        id: (row as any).id,
        packId: (row as any).pack_id,
        question: (row as any).question,
        answer: (row as any).answer,
        category: (row as any).category,
        difficulty: (row as any).difficulty,
        orderIndex: (row as any).order_index
      };
    } catch (error) {
      console.error(`Failed to get pack question ${questionId}:`, error);
      throw error;
    }
  }

  /**
   * Export a pack as JSON
   */
  async exportPack(packId: string): Promise<ExportableQuestionPack> {
    try {
      const pack = await this.getPackById(packId);
      if (!pack) {
        throw new Error(`Pack ${packId} not found`);
      }

      const questions = await this.getPackQuestions(packId);

      return {
        name: pack.name,
        description: pack.description,
        author: pack.author,
        category: pack.category,
        difficulty: pack.difficulty,
        tags: pack.tags,
        questions: questions.map(q => ({
          question: q.question,
          answer: q.answer,
          category: q.category,
          difficulty: q.difficulty
        })),
        version: '1.0.0',
        exportedAt: Date.now()
      };
    } catch (error) {
      console.error(`Failed to export pack ${packId}:`, error);
      throw error;
    }
  }

  /**
   * Import a pack from JSON
   */
  async importPack(exportablePack: ExportableQuestionPack): Promise<string> {
    try {
      const packId = await this.createPack({
        name: exportablePack.name,
        description: exportablePack.description,
        author: exportablePack.author,
        category: exportablePack.category,
        difficulty: exportablePack.difficulty,
        isPublic: false,
        tags: exportablePack.tags
      });

      for (const question of exportablePack.questions) {
        await this.addQuestionToPack(packId, question);
      }

      console.log(`Pack imported successfully with id: ${packId}`);
      return packId;
    } catch (error) {
      console.error('Failed to import pack:', error);
      throw error;
    }
  }

  /**
   * Search packs by name, description, or tags
   */
  async searchPacks(query: string): Promise<QuestionPack[]> {
    try {
      const db = Database.getInstance();
      const searchQuery = `%${query}%`;
      
      const rows = await db.getAllAsync(
        `SELECT * FROM question_packs 
         WHERE name LIKE ? OR description LIKE ? OR tags LIKE ? 
         ORDER BY updated_at DESC`,
        [searchQuery, searchQuery, searchQuery]
      );

      return rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        author: row.author,
        category: row.category,
        difficulty: row.difficulty,
        questionCount: row.question_count,
        isPublic: row.is_public === 1,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        tags: row.tags ? JSON.parse(row.tags) : undefined
      }));
    } catch (error) {
      console.error(`Failed to search packs with query "${query}":`, error);
      throw error;
    }
  }
}

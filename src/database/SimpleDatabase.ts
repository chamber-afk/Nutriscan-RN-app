import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export interface Message {
  id?: number;
  role: 'user' | 'bot';
  text: string;
  chatId: string;
  timestamp?: string;
}

export interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

class SimpleDatabase {
  private db: SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: 'ChatApp.db',
        location: 'default',
      });

      // Create tables
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          role TEXT NOT NULL,
          text TEXT NOT NULL,
          chat_id TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          last_message TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('Database initialized');
    } catch (error) {
      console.error('Database init error:', error);
      throw error;
    }
  }

  // Save message
  async saveMessage(role: 'user' | 'bot', text: string, chatId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.executeSql(
      'INSERT INTO messages (role, text, chat_id) VALUES (?, ?, ?)',
      [role, text, chatId]
    );

    // Update chat's last message
    await this.db.executeSql(
      'INSERT OR REPLACE INTO chats (id, title, last_message, timestamp) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [chatId, this.generateChatTitle(text), text]
    );
  }

  // Get messages for a chat
  async getMessages(chatId: string): Promise<Message[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.executeSql(
      'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC',
      [chatId]
    );

    const messages: Message[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      messages.push({
        id: row.id,
        role: row.role,
        text: row.text,
        chatId: row.chat_id,
        timestamp: row.timestamp
      });
    }

    return messages;
  }

  // Get recent chats
  async getRecentChats(limit: number = 5): Promise<Chat[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.executeSql(
      'SELECT * FROM chats ORDER BY timestamp DESC LIMIT ?',
      [limit]
    );

    const chats: Chat[] = [];
    for (let i = 0; i < result[0].rows.length; i++) {
      const row = result[0].rows.item(i);
      chats.push({
        id: row.id,
        title: row.title,
        lastMessage: row.last_message || '',
        timestamp: row.timestamp
      });
    }

    return chats;
  }

  // Delete a chat
  async deleteChat(chatId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.executeSql('DELETE FROM messages WHERE chat_id = ?', [chatId]);
    await this.db.executeSql('DELETE FROM chats WHERE id = ?', [chatId]);
  }

  // Generate simple chat title from first message
  private generateChatTitle(text: string): string {
    const words = text.split(' ').slice(0, 4).join(' ');
    return words.length > 30 ? words.substring(0, 30) + '...' : words;
  }

  // Generate new chat ID
  generateChatId(): string {
    return 'chat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

export default new SimpleDatabase();
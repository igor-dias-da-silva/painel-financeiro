export interface Database {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string
          title: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      columns: {
        Row: {
          id: string
          title: string
          board_id: string
          order_index: number // Corrigido de 'order' para 'order_index'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          board_id: string
          order_index: number // Corrigido de 'order' para 'order_index'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          board_id?: string
          order_index?: number // Corrigido de 'order' para 'order_index'
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          title: string
          description: string | null
          column_id: string
          order_index: number // Corrigido de 'order' para 'order_index'
          user_id: string
          priority: 'low' | 'medium' | 'high' | 'urgent' // Tipagem mais precisa
          due_date: string | null
          tags: string[] // Tipagem mais precisa
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          column_id: string
          order_index: number // Corrigido de 'order' para 'order_index'
          user_id: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          column_id?: string
          order_index?: number // Corrigido de 'order' para 'order_index'
          user_id?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
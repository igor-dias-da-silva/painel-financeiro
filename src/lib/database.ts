import { supabase } from '@/integrations/supabase/client'

export interface Board {
  id: string
  title: string
  description?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Column {
  id: string
  title: string
  board_id: string
  order_index: number // Alterado de 'order' para 'order_index'
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  title: string
  description?: string
  column_id: string
  order_index: number // Alterado de 'order' para 'order_index'
  user_id: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string;
}

// Boards
export const getBoards = async (userId: string): Promise<Board[]> => {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export const createBoard = async (board: Omit<Board, 'id' | 'created_at' | 'updated_at'>): Promise<Board> => {
  const { data, error } = await supabase
    .from('boards')
    .insert([board])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateBoard = async (id: string, updates: Partial<Board>): Promise<Board> => {
  const { data, error } = await supabase
    .from('boards')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteBoard = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Columns
export const getColumns = async (boardId: string): Promise<Column[]> => {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('order_index') // Alterado de 'order' para 'order_index'
  
  if (error) throw error
  return data || []
}

export const createColumn = async (column: Omit<Column, 'id' | 'created_at' | 'updated_at'>): Promise<Column> => {
  const { data, error } = await supabase
    .from('columns')
    .insert([column])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateColumn = async (id: string, updates: Partial<Column>): Promise<Column> => {
  const { data, error } = await supabase
    .from('columns')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteColumn = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('columns')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Cards
export const getCards = async (boardId: string): Promise<Card[]> => {
  // Para obter os cartões de um quadro, precisamos fazer um JOIN com a tabela 'columns'
  const { data, error } = await supabase
    .from('cards')
    .select(`
      id,
      title,
      description,
      column_id,
      order_index,
      user_id,
      priority,
      due_date,
      tags,
      created_at,
      updated_at,
      columns!inner(board_id)
    `)
    .eq('columns.board_id', boardId)
    .order('order_index'); // Alterado de 'order' para 'order_index'
  
  if (error) throw error;
  // Os dados retornados terão um objeto 'columns' com 'board_id'. Precisamos apenas dos dados do cartão.
  return data.map(card => ({
    id: card.id,
    title: card.title,
    description: card.description,
    column_id: card.column_id,
    order_index: card.order_index, // Alterado de 'order' para 'order_index'
    user_id: card.user_id,
    priority: card.priority,
    due_date: card.due_date,
    tags: card.tags,
    created_at: card.created_at,
    updated_at: card.updated_at,
  })) || [];
}

export const createCard = async (card: Omit<Card, 'id' | 'created_at' | 'updated_at'>): Promise<Card> => {
  const { data, error } = await supabase
    .from('cards')
    .insert([card])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateCard = async (id: string, updates: Partial<Card>): Promise<Card> => {
  const { data, error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteCard = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export const getTotalCards = async (userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('cards')
    .select('id', { count: 'exact' })
    .eq('user_id', userId);
  
  if (error) throw error;
  return count || 0;
}

// Profiles
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    throw error;
  }
  return data || null;
};

export const updateProfile = async (userId: string, updates: Partial<Omit<Profile, 'id' | 'updated_at'>>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
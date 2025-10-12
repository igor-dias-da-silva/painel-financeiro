import { supabase } from './supabase'

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
  order: number
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  title: string
  description?: string
  column_id: string
  order: number
  user_id: string
  created_at: string
  updated_at: string
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
    .order('order')
  
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
export const getCards = async (columnId: string): Promise<Card[]> => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('column_id', columnId)
    .order('order')
  
  if (error) throw error
  return data || []
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
-- Habilita a Row Level Security (RLS) para a tabela de orçamentos.
-- Isso é um pré-requisito para que as políticas abaixo funcionem.
ALTER TABLE shopping_budgets ENABLE ROW LEVEL SECURITY;

-- Habilita a RLS para a tabela de itens de compra.
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas (se existirem) para evitar conflitos.
DROP POLICY IF EXISTS "Users can view their own budgets" ON shopping_budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON shopping_budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON shopping_budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON shopping_budgets;

DROP POLICY IF EXISTS "Users can view items from their own budgets" ON shopping_items;
DROP POLICY IF EXISTS "Users can insert items into their own budgets" ON shopping_items;
DROP POLICY IF EXISTS "Users can update items in their own budgets" ON shopping_items;
DROP POLICY IF EXISTS "Users can delete items from their own budgets" ON shopping_items;


-- Políticas para a tabela 'shopping_budgets'

-- 1. Política de SELECT: Permite que usuários vejam APENAS seus próprios orçamentos.
CREATE POLICY "Users can view their own budgets"
ON shopping_budgets FOR SELECT
USING (auth.uid() = user_id);

-- 2. Política de INSERT: Permite que usuários criem orçamentos APENAS para si mesmos.
CREATE POLICY "Users can insert their own budgets"
ON shopping_budgets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Política de UPDATE: Permite que usuários atualizem APENAS seus próprios orçamentos.
CREATE POLICY "Users can update their own budgets"
ON shopping_budgets FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Política de DELETE: Permite que usuários deletem APENAS seus próprios orçamentos.
CREATE POLICY "Users can delete their own budgets"
ON shopping_budgets FOR DELETE
USING (auth.uid() = user_id);


-- Políticas para a tabela 'shopping_items'

-- 1. Política de SELECT: Permite que usuários vejam itens que pertencem a eles.
CREATE POLICY "Users can view items from their own budgets"
ON shopping_items FOR SELECT
USING (auth.uid() = user_id);

-- 2. Política de INSERT: Permite que usuários adicionem itens APENAS para si mesmos.
CREATE POLICY "Users can insert items into their own budgets"
ON shopping_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Política de UPDATE: Permite que usuários atualizem APENAS seus próprios itens.
CREATE POLICY "Users can update items in their own budgets"
ON shopping_items FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Política de DELETE: Permite que usuários deletem APENAS seus próprios itens.
CREATE POLICY "Users can delete items from their own budgets"
ON shopping_items FOR DELETE
USING (auth.uid() = user_id);
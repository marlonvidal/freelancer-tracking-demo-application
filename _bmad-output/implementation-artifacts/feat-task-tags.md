---
feature: Tags em Tarefas
status: done
date: "2026-04-11"
author: Marlon (via bmad-quick-dev)
baseline_commit: 987a13d40b14011ec0e81115093b077c09b00b5b
---

# Especificação de Implementação — Tags em Tarefas

## Objetivo

Expor o campo `tags: string[]` já presente no modelo `Task` na interface visual — permitindo ao usuário adicionar e remover tags livres ao criar uma tarefa e ao editar seus detalhes, e exibindo as tags como chips coloridos diretamente nos cartões do Kanban para facilitar a classificação e organização das atividades.

---

## Contexto técnico

| Item | Detalhe |
|------|---------|
| Modelo de dados | `Task.tags: string[]` já existe em `src/types/index.ts` |
| Reducer | `UPDATE_TASK` em `AppContext` já aceita `Partial<Task>` — nenhuma alteração necessária |
| Persistência | `localStorage` via `src/lib/storage.ts` — persiste o objeto completo sem alteração |
| Seed data | Tarefas demo já possuem tags (ex.: `['design', 'ui']`, `['development', 'backend']`) |
| Idiomas suportados | Inglês (`en`) e Português (`pt`) via `LanguageContext` |
| Componentes UI base | `Input`, `Label`, `Badge` (shadcn/ui + Radix) |

---

## Arquivos modificados

| Arquivo | Tipo de alteração |
|---------|------------------|
| `src/context/LanguageContext.tsx` | Modificado |
| `src/components/AddTaskDialog.tsx` | Modificado |
| `src/components/TaskDetailPanel.tsx` | Modificado |
| `src/components/TaskCard.tsx` | Modificado |

Nenhum arquivo novo criado. Nenhuma alteração em `src/types/index.ts`, `AppContext.tsx` ou `storage.ts`.

---

## Detalhamento das alterações

### `LanguageContext.tsx` — novas strings i18n

Strings adicionadas ao tipo `Translations` e às duas locales (`en` / `pt`):

| Chave | EN | PT |
|-------|----|----|
| `tags` | Tags | Tags |
| `addTag` | Add tag... | Adicionar tag... |

```ts
// interface Translations
tags: string;
addTag: string;
```

---

### `AddTaskDialog.tsx` — campo de tags com chips

**Novos estados locais:**

```ts
const [tags, setTags] = useState<string[]>([]);
const [tagInput, setTagInput] = useState('');
```

**Handler `handleTagKeyDown`** — acionado ao pressionar `Enter` ou `,`:

```ts
const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const tag = tagInput.trim().replace(/,$/, '');
    if (tag && !tags.includes(tag)) {
      setTags(prev => [...prev, tag]);
    }
    setTagInput('');
  }
};
```

**Handler `removeTag`:**

```ts
const removeTag = (tag: string) => {
  setTags(prev => prev.filter(t => t !== tag));
};
```

**Alteração no `handleSubmit`** — substituir `tags: []` por `tags`:

```ts
dispatch({
  type: 'ADD_TASK',
  payload: {
    // ...demais campos
    tags,
  },
});
```

**Reset do formulário** — adicionar ao bloco de reset:

```ts
setTags([]);
setTagInput('');
```

**UI — seção de tags** (posicionar após "Time Estimate", antes dos botões de ação):

```tsx
{/* Tags */}
<div>
  <Label>{t.tags}</Label>
  {tags.length > 0 && (
    <div className="flex flex-wrap gap-1.5 mb-2 mt-1">
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="hover:text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )}
  <Input
    value={tagInput}
    onChange={(e) => setTagInput(e.target.value)}
    onKeyDown={handleTagKeyDown}
    placeholder={t.addTag}
    className="mt-1"
  />
</div>
```

**Import adicional necessário:** `X` de `lucide-react` (adicionar ao import existente de `Plus`).

---

### `TaskDetailPanel.tsx` — edição de tags em tarefa existente

**Novo estado local:**

```ts
const [tagInput, setTagInput] = useState('');
```

**Handler `handleTagKeyDown`:**

```ts
const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const tag = tagInput.trim().replace(/,$/, '');
    if (tag && localTask && !localTask.tags.includes(tag)) {
      handleUpdate({ tags: [...localTask.tags, tag] });
    }
    setTagInput('');
  }
};
```

**Handler `handleRemoveTag`:**

```ts
const handleRemoveTag = (tag: string) => {
  if (!localTask) return;
  handleUpdate({ tags: localTask.tags.filter(t => t !== tag) });
};
```

**UI — seção de tags** (posicionar após "Due Date", antes de "Billable & Rate"):

```tsx
{/* Tags */}
<div>
  <Label className="text-xs text-muted-foreground flex items-center gap-1">
    <Tag className="h-3 w-3" />
    {t.tags}
  </Label>
  {localTask.tags.length > 0 && (
    <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
      {localTask.tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={() => handleRemoveTag(tag)}
            className="hover:text-destructive transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  )}
  <Input
    value={tagInput}
    onChange={(e) => setTagInput(e.target.value)}
    onKeyDown={handleTagKeyDown}
    placeholder={t.addTag}
    className="mt-1 h-8 text-sm"
  />
</div>
```

**Import adicional necessário:** `Tag` de `lucide-react` (adicionar ao import existente — `X` já está importado).

---

### `TaskCard.tsx` — exibição de tags como badges

Renderizar `task.tags` como chips após a linha "Client & Priority" (linha 125), antes da seção de tempo. Exibir no máximo 2 tags; se houver mais, mostrar `+N`:

```tsx
{/* Tags */}
{task.tags.length > 0 && (
  <div className="flex items-center gap-1 flex-wrap mb-2">
    {task.tags.slice(0, 2).map(tag => (
      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
        {tag}
      </Badge>
    ))}
    {task.tags.length > 2 && (
      <span className="text-[10px] text-muted-foreground">
        +{task.tags.length - 2}
      </span>
    )}
  </div>
)}
```

Nenhum import adicional necessário — `Badge` já está importado.

---

## Critérios de aceitação

| # | Dado | Quando | Então |
|---|------|--------|-------|
| 1 | Formulário de nova tarefa aberto | Usuário digita uma tag e pressiona Enter | Tag aparece como chip acima do input |
| 2 | Formulário de nova tarefa com tags | Usuário digita tag com vírgula (ex.: `frontend,`) | Tag é adicionada sem o caractere vírgula |
| 3 | Chip de tag no formulário | Usuário clica no × do chip | Tag é removida da lista |
| 4 | Tarefa duplicada no input | Usuário tenta adicionar tag já existente | Tag não é adicionada novamente (deduplicação) |
| 5 | Nova tarefa criada com tags | Tarefa aparece no Kanban | Tags exibidas como badges no cartão |
| 6 | Tarefa com mais de 2 tags | Cartão exibido no Kanban | Apenas 2 tags visíveis + indicador `+N` |
| 7 | Painel de detalhes aberto | Usuário adiciona tag no campo e pressiona Enter | Tag salva imediatamente (dispatch `UPDATE_TASK`) |
| 8 | Painel de detalhes com tag | Usuário clica no × de uma tag existente | Tag removida e persistida |
| 9 | Reload da página | — | Tags das tarefas persistem via `localStorage` |
| 10 | Idioma alternado PT ↔ EN | Label do campo e placeholder | Traduzidos corretamente |

---

## Decisões de design

- **Tags como strings livres** — sem enum pré-definido, sem entidade separada. O modelo `string[]` já existente é suficiente; adicionar uma entidade `Tag` seria over-engineering para o escopo atual.
- **Chips inline, sem componente separado** — o padrão do projeto usa lógica de UI nos próprios dialogs (ver `AddClientDialog`). Não há repetição suficiente para justificar extração.
- **Enter ou vírgula para adicionar** — convenção amplamente reconhecida em interfaces de tagging (GitHub, Linear, Jira).
- **Deduplicação client-side** — tags duplicadas são ignoradas silenciosamente; sem mensagem de erro para não interromper o fluxo de digitação.
- **Máximo 2 tags no cartão** — os cartões do Kanban têm espaço limitado. O indicador `+N` mantém a densidade visual controlada sem perder informação.
- **Sem react-hook-form/Zod** — consistente com os demais dialogs do projeto. Validação inline simples é suficiente.
- **`UPDATE_TASK` existente** — o reducer já aceita `Partial<Task>`, portanto atualizar `tags` não requer nenhuma nova ação.

---

## Testes sugeridos (próximo passo)

- **Unitário:** `AddTaskDialog` — adicionar tag via Enter, via vírgula, deduplicação, remoção de chip, tags incluídas no payload do dispatch
- **Unitário:** `TaskDetailPanel` — adicionar e remover tag chama `UPDATE_TASK` com o array correto
- **Unitário:** `TaskCard` — exibição correta com 0, 1, 2 e 3+ tags
- **E2E:** criar tarefa com tags → verificar exibição no cartão → abrir detalhes → editar tags → recarregar página e verificar persistência

---

## Suggested Review Order

**Contratos de i18n**

- Novas chaves `tags`/`addTag` adicionadas ao tipo e às duas locales — ponto de entrada do contrato.
  [`LanguageContext.tsx:61`](../../src/context/LanguageContext.tsx#L61)

**Lógica de adição/remoção de tags no diálogo de criação**

- Handlers `handleTagKeyDown` e `removeTag` — deduplicação, split por vírgula, prevent default.
  [`AddTaskDialog.tsx:88`](../../src/components/AddTaskDialog.tsx#L88)

- Tags incluídas no payload do `ADD_TASK` e limpas no reset do formulário.
  [`AddTaskDialog.tsx:69`](../../src/components/AddTaskDialog.tsx#L69)

- Seção de UI com chips removíveis e input de digitação livre.
  [`AddTaskDialog.tsx:259`](../../src/components/AddTaskDialog.tsx#L259)

**Lógica de edição de tags no painel de detalhes**

- Handlers `handleTagKeyDown` / `handleRemoveTag` — despacham `UPDATE_TASK` imediatamente.
  [`TaskDetailPanel.tsx:49`](../../src/components/TaskDetailPanel.tsx#L49)

- Reset de `tagInput` ao trocar de tarefa — evita texto residual entre tarefas.
  [`TaskDetailPanel.tsx:33`](../../src/components/TaskDetailPanel.tsx#L33)

- Seção de UI com chips e input inline no painel lateral.
  [`TaskDetailPanel.tsx:204`](../../src/components/TaskDetailPanel.tsx#L204)

**Exibição de tags nos cartões do Kanban**

- Badges com limite de 2 tags visíveis + indicador `+N` — controle de densidade visual.
  [`TaskCard.tsx:142`](../../src/components/TaskCard.tsx#L142)

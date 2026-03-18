# Vital Tec - Controle de Estoque e Responsabilidade

App web da Vital Tec com:
- login por nome + senha
- criação de novos usuários dentro do app
- perfil administrador e operador
- dashboard, funcionários, inventário, entregas, reparos e relatórios
- assinatura digital no recebimento
- banco Supabase + frontend Vite/React

## Publicação rápida

### 1. Criar projeto no Supabase
Crie um projeto novo e, no SQL Editor, rode o arquivo:

`docs/schema.sql`

### 2. Ajuste obrigatório no Supabase Auth
No painel do Supabase, desative a confirmação obrigatória de e-mail:

Auth > Providers > Email > desligar **Confirm email**

Isso é necessário porque o sistema usa login por nome e senha, convertendo internamente o nome em um e-mail técnico.

### 3. Variáveis de ambiente
No deploy, configure:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Publicar na Vercel
Use a pasta `frontend` como raiz do projeto.

Configuração:
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### 5. Primeiro acesso
Na tela de login, clique em:

`Primeiro acesso? Criar administrador inicial`

Cadastre:
- nome
- senha

Esse primeiro usuário vira **administrador** automaticamente.

### 6. Criar novos usuários no app
Depois de entrar como administrador, use o menu **Usuários** para:
- criar novos acessos
- alternar entre admin e operador
- ativar ou desativar usuários

## Desenvolvimento local

```bash
cd frontend
npm install
npm run dev
```

## Build de produção

```bash
cd frontend
npm run build
```

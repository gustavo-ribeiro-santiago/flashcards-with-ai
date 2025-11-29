# 🧠 Flashcards com IA

Uma aplicação web moderna de flashcards com geração automática de conteúdo por Inteligência Artificial, desenvolvida com React e Firebase.

## ✨ Características

- 🤖 **Geração Automática**: Crie flashcards sobre qualquer tema usando GPT-5-Mini
- 🔐 **Autenticação**: Login seguro com Google através do Firebase Auth
- 📚 **Organização por Classes**: Organize seus flashcards em diferentes categorias/temas
- 📊 **Analytics de Performance**: Acompanhe seu progresso com gráficos detalhados
- 🎯 **Sistema de Estudo**: Interface intuitiva para praticar com feedback imediato
- ✏️ **Edição Completa**: Edite o conteúdo dos flashcards após a geração
- 🌐 **Multilíngue**: Suporte para Português e Inglês
- 📱 **Responsivo**: Interface moderna que funciona em todos os dispositivos

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

### Backend
- **Firebase Functions** - Serverless Functions em Python
- **Firebase Firestore** - Banco de dados NoSQL
- **Firebase Auth** - Autenticação
- **Firebase Hosting** - Hospedagem

### IA
- **OpenAI GPT-5-Mini** - Geração de conteúdo

## 📁 Estrutura do Projeto

```
flashcards-with-ai/
├── public/                 # Arquivos públicos
├── src/
│   ├── components/         # Componentes React reutilizáveis
│   ├── contexts/          # Contextos (Auth, Language)
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Serviços (API, Firestore)
│   └── App.js             # Componente principal
├── functions/             # Firebase Functions (Python)
├── firebase.json          # Configuração do Firebase
├── firestore.rules        # Regras de segurança do Firestore
└── package.json           # Dependências do projeto
```

## ⚙️ Configuração

### 1. Pré-requisitos
- Node.js 16+
- npm ou yarn
- Conta Firebase
- Chave API OpenAI

### 2. Configuração do Firebase
1. Crie um novo projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative Authentication, Firestore e Functions
3. Configure o Google como provedor de autenticação
4. Copie as configurações do projeto

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
REACT_APP_FIREBASE_API_KEY=sua_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=seu_projeto_id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
REACT_APP_FIREBASE_APP_ID=seu_app_id
```

### 4. Configuração das Functions
Configure a chave da OpenAI nas Firebase Functions (use letras minúsculas):
```bash
firebase functions:config:set openai.api_key="sua_chave_openai"
```

### 5. Instalação
```bash
# Instalar dependências do frontend
npm install

# Instalar dependências das functions
cd functions
pip install -r requirements.txt
cd ..
```

## 🚀 Como Executar

### Desenvolvimento Local
```bash
# Iniciar o frontend
npm start

# Em outro terminal, iniciar as functions (opcional)
firebase emulators:start --only functions
```

### Deploy para Produção
```bash
# Build do projeto
npm run build

# Deploy completo
firebase deploy

# Deploy apenas functions
firebase deploy --only functions

# Deploy apenas hosting
firebase deploy --only hosting
```

## 📊 Funcionalidades Principais

### 🎓 Criação de Flashcards
1. Escolha um tema (ex: "Japonês", "História do Brasil")
2. Selecione a quantidade de cartões (5-50)
3. A IA gera automaticamente perguntas e respostas
4. Edite o conteúdo se necessário

### 📖 Sistema de Estudo
- Interface de cartões com frente e verso
- Sistema de feedback (correto/incorreto)
- Tracking automático de performance
- Cronômetro para medir tempo de estudo

### 📈 Analytics de Performance
- **Melhor Pontuação**: Maior precisão alcançada
- **Evolução Temporal**: Gráficos de progresso
- **Análise de Erros**: Cartões com mais dificuldade
- **Métricas de Tempo**: Velocidade de resposta

### ✏️ Edição de Conteúdo
- Editar frente e verso dos cartões
- Adicionar novos cartões manualmente
- Excluir cartões desnecessários
- Salvar alterações em tempo real

## 🔒 Segurança

- **Autenticação**: Apenas usuários autenticados podem acessar
- **Autorização**: Usuários só veem seus próprios dados
- **Firestore Rules**: Regras rigorosas de acesso ao banco
- **Validação**: Validação de dados no frontend e backend

## 🌐 Internacionalização

A aplicação suporta dois idiomas:
- **Português (padrão)**: Interface completa em português
- **Inglês**: Alternativa via botão no navbar

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎯 Roadmap

- [ ] Modo offline
- [ ] Exportação de flashcards
- [ ] Compartilhamento de classes
- [ ] Mais modelos de IA
- [ ] Gamificação
- [ ] Estatísticas avançadas

## 📧 Contato

Para dúvidas ou sugestões, entre em contato através das issues do GitHub.

---

Desenvolvido com ❤️ usando React, Firebase e OpenAI
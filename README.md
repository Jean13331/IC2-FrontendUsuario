## IC2-FrontendUsuario

Portal do usuário construído com React + TypeScript, Vite e Material UI (MUI). Projeto preparado para uso em desktop e mobile, com tipografia e layout responsivos.

### Requisitos
- Node.js 18+
- npm 9+ (ou pnpm/yarn)

### Como começar
```bash
# instalar dependências
npm install

# subir ambiente de desenvolvimento
npm run dev

# acessar
# http://localhost:5173/
```

### Scripts
- `npm run dev`: inicia o servidor de desenvolvimento (Vite)
- `npm run build`: gera build de produção em `dist/`
- `npm run preview`: serve o build localmente para testes

### Stack
- React 18 + TypeScript
- Vite 5
- Material UI (MUI) 6 + Emotion
- React Router 6

### Estrutura principal
```
IC2-FrontendUsuario/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ src/
   ├─ main.tsx              # Provider do tema, Router e bootstrap
   ├─ App.tsx               # Layout base e rotas
   ├─ components/
   │  └─ ResponsiveAppBar.tsx
   └─ pages/
      └─ Home.tsx
```

### Responsividade
- Tema com `responsiveFontSizes` e breakpoints do MUI (`xs`, `sm`, `md`, `lg`, `xl`).
- AppBar responsiva com Drawer no mobile e navegação horizontal no desktop.
- Containers e espaçamentos ajustados conforme o breakpoint.

### Customização de tema
Edite `src/main.tsx` para alterar cores, tipografia e breakpoints.

### Variáveis de ambiente
Crie arquivos `.env` (ex.: `.env.local`). Exemplo:
```
VITE_API_BASE_URL=https://sua.api
```
Use via `import.meta.env.VITE_API_BASE_URL`.

### Boas práticas
- Componentes com nomes claros e props tipadas.
- Evite lógica complexa em JSX; quebre em funções/componentes.
- Utilize `sx` do MUI ou Emotion para estilos.

### Build e deploy
```bash
npm run build
```
O build fica em `dist/` e pode ser hospedado em qualquer servidor de arquivos estáticos (NGINX, S3, Vercel, Netlify, etc.).

### Problemas comuns
- Porta ocupada: `npm run dev -- --port 5174`.
- Cache do Vite: reinicie o dev server; limpe a pasta `.vite` se necessário.

### Licença
Privado/Interno (ajuste conforme a política da sua organização).



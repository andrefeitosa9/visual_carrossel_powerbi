# Carrossel de Imagens - Power BI Custom Visual

Visual customizado para Power BI que exibe imagens em formato de carrossel ou grid, com suporte a títulos, subtítulos e filtros interativos.

## 🎯 Funcionalidades

- **Dois modos de visualização**: Carrossel e Grid
- **Toggle visual** para alternar entre modos (opcional)
- **Títulos e subtítulos dinâmicos** por linha
- **Posicionamento flexível** do texto (Topo, Base, Esquerda, Direita, Sobreposto ou Oculto)
- **Grid configurável** com linhas/colunas por página e paginação
- **Cross-filter via ícone** dedicado (não interfere com navegação)
- **Respeita filtros** e segmentações da página
- **Suporte a imagens**: URLs públicas ou data URIs (Base64)

## 📋 Requisitos

- Node.js 14+
- Power BI Desktop
- pbiviz (Power BI Visual Tools)

## 🚀 Instalação

### Para desenvolvedores

```bash
# Clone o repositório
git clone https://github.com/andrefeitosa9/carrosselFinal.git
cd carrosselFinal

# Instale as dependências
npm install

# Rode em modo desenvolvimento
npm start

# Ou empacote o visual
npm run package
```

### Para usuários finais

1. Baixe o arquivo `.pbiviz` da pasta `dist/` (ou da última release)
2. No Power BI Desktop:
   - Início → Mais visuais → Importar um visual de um arquivo
   - Selecione o arquivo `.pbiviz`
3. Arraste o visual para sua página

## 🎨 Como usar

### Configurar campos

1. **URL da Imagem**: coluna com URL pública ou data URI (imagem em Base64)
2. **Título**: campo textual para título principal
3. **Subtítulo 1**: primeiro subtítulo (opcional)
4. **Subtítulo 2**: segundo subtítulo (opcional)

### Formatação

**Layout e Estilo:**
- **Modo de Exibição**: Carrossel ou Grid (se toggle visual desligado)
- **Mostrar botão de alternância de modo**: exibe toggle Carrossel/Grid no topo
- **Posição do Texto**: Topo, Base, Esquerda, Direita, Sobreposto (Topo/Base), Oculto
- **Grid: linhas por página**: quantidade de linhas no grid
- **Grid: colunas por página**: quantidade de colunas no grid
- **Cor de Fundo**: cor de fundo do visual
- **Cor do Texto**: cor dos títulos e subtítulos
- **Tamanho da Fonte**: tamanho do texto em pixels

### Navegação

- **Carrossel**: use os botões ❮ e ❯ para navegar entre imagens
- **Grid**: use os botões ❮ e ❯ na parte inferior para navegar entre páginas
- **Toggle visual**: clique em "Carrossel" ou "Grid" no topo para alternar o modo

### Cross-filter

- Clique no **ícone ◉** (canto superior direito) para filtrar a página por aquela linha
- `Ctrl`+clique para multi-seleção
- Clique no fundo do visual para limpar filtros

## ️ Desenvolvimento

### Estrutura do projeto

```
carrosselFinal/
├── src/
│   ├── visual.ts          # Lógica principal do visual
│   └── settings.ts        # Configurações de formatação (Format Pane)
├── style/
│   └── visual.less        # Estilos CSS/LESS
├── assets/
│   └── icon.png           # Ícone do visual
├── capabilities.json      # Definição de campos e mapeamento
├── pbiviz.json           # Metadados do visual
├── tsconfig.json         # Configuração TypeScript
└── package.json          # Dependências e scripts
```

### Scripts disponíveis

- `npm start`: inicia o visual em modo dev (pbiviz start)
- `npm run package`: empacota o visual (.pbiviz)
- `npm run lint`: valida código com ESLint

### Tecnologias

- **TypeScript 5.5**
- **Power BI Visuals API 5.11**
- **FormattingModel API** (Format Pane moderno)
- **D3.js 7.9** (disponível mas não usado atualmente)
- **LESS** para estilos

## 📝 Changelog

### v1.1.0 (2026-01-07)

- ✨ Adicionado toggle visual para alternar Carrossel/Grid
- ✨ Cross-filter via ícone dedicado (não interfere com navegação)
- ✨ Suporte a table mapping (texto por linha)
- ✨ Posições adicionais: Esquerda, Direita, Sobreposto
- ✨ Grid com paginação e configuração de linhas/colunas
- 🔧 Migrado para Format Pane moderno (FormattingModel API)
- 🐛 Corrigido posicionamento "Base" do texto

### v1.0.0

- 🎉 Release inicial

## 📄 Licença

MIT

## 👤 Autor

**Andre Feitosa**
- GitHub: [@andrefeitosa9](https://github.com/andrefeitosa9)
- Email: andrefeitosa9@gmail.com

## 🤝 Contribuindo

Contribuições, issues e feature requests são bem-vindos!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

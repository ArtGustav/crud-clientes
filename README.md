# Cadastro de Clientes (CRUD)

Projeto CRUD completo em HTML, CSS e JavaScript puro, com persistencia em
localStorage.

## Objetivo
Demonstrar operacoes de Create, Read, Update e Delete sem frameworks, com
validacao e feedback visual.

## Como rodar
1. Abra o arquivo `index.html` no navegador.
2. Use o formulario para cadastrar e a tabela para editar ou excluir.

## Funcionalidades
- Cadastro com validacao (nome minimo 3 caracteres, email valido).
- Nao permite emails duplicados.
- Edicao com preenchimento automatico do formulario.
- Exclusao com confirmacao.
- Busca por nome ou email.
- Ordenacao por nome ou data de criacao.
- Paginacao simples (5 por pagina).
- Exportacao e importacao de dados em JSON.
- Mensagens visuais de sucesso/erro.

## Estrutura
```
/crud-clientes
  /assets
    /css/style.css
    /js/app.js
  index.html
  README.md
```

## Observacoes
- Todos os dados ficam no `localStorage` do navegador.
- Para limpar os dados, use a opcao de limpeza do navegador.

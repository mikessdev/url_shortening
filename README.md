# url_shortening

swagger: localhost:3000/swagger/api-docs

## Versões

Node: 20.18.0

Npm: 10.8.2

Docker: 27.2.1 (build 9e34c9bb39)

# Para rodar o projeto basta apenas executar o comando abaixo em ordem.

## Instalando dependências

Para instalar as dependências, execute os seguintes comandos:

```bash
npm install
```

Para subir o container do PostgreSQL, execute os seguintes comandos:

```bash
docker-compose up -d
```

Para rodar as migrations, execute os seguintes comandos:

```bash
npx sequelize-cli db:migrate
```

## Rodando o projeto

Para rodar o projeto, execute os seguintes comandos:

```bash
npm run dev
```

Para executar os testes, execute os seguintes comandos:

```bash
npm run test
```

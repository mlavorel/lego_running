# Lego Running

Aplicação web local para montar rotas compostas a partir de trilhas GPX salvas no IndexedDB.

## Como executar

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```

## Funcionalidades principais

- Upload de arquivos `.gpx` e extração do track principal (`trk/trkseg/trkpt`).
- Persistência local com Dexie/IndexedDB (`RouteSources` e `Segments`).
- Criação de segmentos via clique no mapa com snap para ponto mais próximo da trilha.
- Biblioteca de segmentos com busca por nome/distância.
- Route builder com ordenação drag-and-drop, reverse e remoção.
- Composição de rota com cálculo de distância total e trecho de teleport.
- Preview da rota composta no mapa e exportação GPX.
- Export/import da biblioteca completa em JSON (estratégia de substituição ao importar).

## Limitações explícitas

- Sem backend, login ou colaboração multiusuário.
- Sem integração com APIs externas.
- Sem roteamento em vias (snap-to-road).
- Sem serviços de elevação externos.
- Sem validações avançadas de topologia de trilha.

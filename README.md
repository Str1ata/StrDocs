# Str Framework Docs

Site estático de documentação da framework Str (FiveM/RedM), em português.

## Desenvolvimento local

Abra `index.html` no navegador. Não há etapa de build nem dependências de pacote; a busca e a navegação rodam no browser.

## GitHub Pages

O workflow em `.github/workflows/pages.yml` publica o conteúdo deste repositório em cada push na branch `main`. No GitHub, habilite Pages em **Settings → Pages → Build and deployment → GitHub Actions**. O workflow também pode ser iniciado manualmente em **Actions**.

## Atualização da referência

Ao alterar `Str.lua`, `client.lua` ou módulos documentados, mantenha os catálogos de `Str.functions` e statebags em `app.js`, incluindo parâmetros, tipo/forma do retorno e exemplos relevantes em `index.html`. A documentação descreve o código existente; confirme os comportamentos no fonte antes de registrar novos detalhes.

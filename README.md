# StrDocs

Documentação da framework Str para FiveM, SixM e RedM, com referência das APIs client/server, funções `Str.functions`, statebags e exemplos práticos.

Site estático em português. Abra `index.html` no navegador para consultar a documentação; não há etapa de build nem dependências de pacote.

## GitHub Pages

O workflow em `.github/workflows/pages.yml` publica o site a cada push na branch `main`. No GitHub, habilite Pages em **Settings → Pages → Build and deployment → GitHub Actions**. O workflow também pode ser iniciado manualmente em **Actions**.

## Atualização da referência

Ao alterar `Str.lua`, `client.lua` ou módulos documentados, mantenha os catálogos de `Str.functions` e statebags em `app.js`, incluindo parâmetros, tipo/forma do retorno e exemplos relevantes em `index.html`. A documentação descreve o código existente; confirme os comportamentos no fonte antes de registrar novos detalhes.

# 🎬 SerieVault — Consumindo API com PHP

Este repositório foi desenvolvido com o objetivo de registrar o aprendizado, a arquitetura e a experiência prática de construir um gerenciador de séries e interações de usuário (SerieVault), utilizando **PHP** no backend para consumir APIs externas e expor endpoints rest, integrado a uma interface dinâmica e moderna construída em **React** (sem necessidade de bundlers pesados, carregada diretamente via navegador).

---

## 💡 Experiência de Aprendizado: Consumindo APIs com PHP

A transição ou aprendizado de consumo de APIs utilizando PHP traz reflexões importantes sobre a flexibilidade e maturidade da linguagem no desenvolvimento web moderno. Abaixo estão descritos os principais aprendizados e marcos dessa experiência:

### 1. Desmistificando Requisições HTTP em PHP
Diferente de ecossistemas front-end modernos baseados em Promises (`fetch` ou `axios` em JavaScript), o PHP trabalha no modelo síncrono por padrão. A jornada de aprendizado passou por entender os diferentes métodos para realizar requisições HTTP:
*   **`file_get_contents`**: Utilizado para chamadas mais simples e diretas, configurando streams de contexto.
*   **cURL (`curl_init`, `curl_exec`)**: Entendido como a ferramenta definitiva e robusta do PHP para lidar com cabeçalhos de requisição, timeouts, métodos HTTP diversos (`GET`, `POST`, `PUT`, `DELETE`) e tratamento fino de erros de rede.
*   **Manipulação de JSON**: O uso de `json_decode($response, true)` foi essencial para transformar as respostas brutas de APIs REST externas (como a **TVMaze API**) em arrays associativos nativos do PHP, facilitando a filtragem e exibição dos dados.

### 2. Integração Backend-Frontend e Arquitetura REST
A arquitetura do **SerieVault** foi desenhada para colocar o PHP no coração do fluxo:
1.  **Consumo de API Externa**: O backend em PHP consome a **TVMaze API** para buscar dados estruturados de programas de TV, episódios e rankings.
2.  **Tratamento e Enriquecimento**: Os dados retornados da API externa são mesclados com dados do nosso banco de dados local (MySQL) para injetar informações personalizadas do usuário (status da série como "Minha Lista" ou "Assistidos", avaliações, favoritos).
3.  **Entrega como API REST**: O PHP expõe sua própria API JSON limpa e estruturada para o frontend em React. Isso evitou problemas comuns como CORS no cliente, permitiu cache e proteção de dados, além de otimizar a carga útil de dados enviada para o navegador.

### 3. Persistência de Dados e Banco de Relacional
Compreender como correlacionar os IDs únicos vindos da API pública (TVMaze ID) com os registros de usuários locais na tabela `usuarios` e `acoes_usuario` foi um passo vital. Usar **PDO (PHP Data Objects)** garantiu:
*   Consultas preparadas (`Prepared Statements`) seguras contra injeção de SQL.
*   Inicialização e migrations automáticas diretamente pelo código PHP ao subir o servidor.
*   Mapeamento de estatísticas e contagem de itens de forma performática.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi erguido sobre uma stack moderna e enxuta:

*   **Backend:**
    *   **PHP** (nativo, sem frameworks para consolidar conceitos de rotas, controllers e CORS).
    *   **MySQL** para persistência de dados.
    *   **PDO** para abstração e segurança do banco de dados.
*   **Frontend:**
    *   **JavaScript (React)** carregado via CDN para uma SPA (Single Page Application) rápida e responsiva.
    *   **Vanilla CSS** customizado com variáveis (CSS Variables) para um design escuro premium, responsivo e fluido.
*   **Integrações:**
    *   **TVMaze API** (Consulta e busca de dados de shows, episódios e elencos).

---

## 📱 Funcionalidades Implementadas

*   🔍 **Busca de Séries em Tempo Real**: Consumindo a API TVMaze e gerando grids responsivos de cards.
*   🔖 **Minha Lista e Status**: Marcar obras como "Pretendo assistir", "Assistindo", "Assistido" ou "Abandonado".
*   ❤️ **Favoritar Obras**: Criação de um mural dinâmico com séries favoritas.
*   📊 **Estatísticas do Usuário**: Gráfico de progresso circular dinâmico (SVG) baseado na proporção de obras concluídas sobre as salvas.
*   👤 **Perfil Completo**: Foto de perfil com upload e validação de imagens (JPG/PNG/WEBP) no PHP, bio com contador de caracteres e nome de exibição editável.
*   📱 **Layout Totalmente Fluido**: Sidebar responsivo que vira bottom-bar no mobile, grid inteligente (4 colunas no desktop, 2 no tablet e 1 no mobile) e 0% de overflow horizontal.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
*   **Servidor Web local** (XAMPP, WampServer, Laragon ou PHP Built-in Server).
*   **MySQL** ativo.
*   **Git** instalado.

### Passo a Passo

1.  **Clonar o Repositório:**
    ```bash
    git clone https://github.com/AlefLorenzo/Consumindo-Api.git
    ```
2.  **Mover para a pasta do Servidor Web:**
    Certifique-se de que a pasta clonada esteja nomeada como `serievault` e dentro do diretório raiz do seu servidor local (ex: `C:\xampp\htdocs\serievault`).

3.  **Configurar o Banco de Dados:**
    *   O PHP criará automaticamente o banco de dados `crud` e todas as tabelas necessárias na primeira execução.
    *   Caso suas credenciais locais do MySQL sejam diferentes do padrão (Host: `localhost`, Usuário: `root`, Senha: `vazio`), ajuste no arquivo [config/db.php](config/db.php).

4.  **Acessar no Navegador:**
    Abra `http://localhost/serievault` e comece a registrar e gerenciar suas séries preferidas!

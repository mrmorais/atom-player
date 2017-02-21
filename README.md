![Atom Player](http://atomplayer.com.br/assets/img/logo_br.png =250px)

# Atom podcast Player
[![Gitter](https://badges.gitter.im/Atom-Player/Lobby.svg)](https://gitter.im/Atom-Player/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=body_badge)

### Descrição
Atom podcast player é um player de (podcast)[podcast_wiki] desenvolvido em 2016, que utiliza uma stack Node.js + Mongo DB no back-end e AngularJS (1) no front-end. Além de player, o Atom também agrega podcasts para usuários cadastrados gerando uma base de dados acessível via web.

Esta aplicação está rodando no endereço: (http://atomplayer.com.br)[atom_lnk] e a intenção é que o código neste repositório esteja em produção no servidor.

Existem algumas funcionalidades que ainda não foram implementadas que posteriormente irei relatar como issue do projeto para que possam ser feitas contribuições. Além disso, é um projeto carente de documentação que será brevemente escrita.

### Requisitos de Software
- Node.js: v6.9.5
- Mongo DB: 3.4

### Contribuindo
Este repositório está vinculado à um canal do Gitter.im para discussão. Antes de contribuir relate o problema/solução no canal: (https://gitter.im/Atom-Player)[https://gitter.im/Atom-Player].

Para submeter uma contribuição, você deve:
 - Abrir um issue no projeto. Se necessário, discutir no Gitter.im ou no próprio issue.
 - Seguir a GitHub Workflow, detalhada a seguir.

#### GitHub Workflow
- 'Clone' o repositório do projeto
```
git clone https://github.com/mrmorais/atom-player.git
```
- Crie um branch para o seu bug/release (deve possuir o ID da issue aberta):
```
git checkout -b new-issue-88888
```
- Codifique dentro do branch criado
- Commit as mudanças feitas no código:
```
git add .
git commit -m 'fix bug 88888 - mensagem do commit'
```
- submeta seu branch para o GitHub
```
git push origin new-issue-88888
```
- Envie um pull request no GitHub

Seu código será revisado e mesclado no branch principal e por fim será enviado para produção em (Atom Player)[atom_lnk]

[podcast_wiki]: https://en.wikipedia.org/wiki/Podcast
[atom_lnk]: http://atomplayer.com.br

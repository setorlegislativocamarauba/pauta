Opção 1: Rodando via Docker (Recomendada e mais fácil)
Se o servidor da Câmara possuir o Docker instalado, esta é a forma mais profissional:
Vá nas configurações do AI Studio (ícone da engrenagem no canto superior direito) e clique em Export to ZIP para baixar o código fonte completo.
Extraia o ZIP no seu servidor.
Dentro da pasta extraída, crie um arquivo chamado Dockerfile e cole o seguinte código:
code
Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
No terminal do servidor, execute os comandos:
code
Bash
docker build -t portal-pautas .
docker run -d -p 3000:3000 --name pautas-app portal-pautas
Agora o aplicativo estará rodando em http://IP_DO_SEU_SERVIDOR:3000. Você pode usar o Nginx ou Apache do seu servidor principal para criar um proxy reverso e apontar um subdomínio bonito (ex: pautas.uba.mg.leg.br) para essa porta 3000.
Opção 2: Rodando diretamente com Node.js e PM2
Se você tiver acesso root no servidor e preferir instalar o Node.js diretamente (no Ubuntu, Debian, etc.):
Baixe o ZIP do projeto aqui no AI Studio.
Instale o Node.js no servidor.
Transfira a pasta extraída para o servidor (ex: /var/www/portal-pautas).
Abra o terminal na pasta do projeto e execute:
code
Bash
npm install
npm run build
Instale o PM2 (gerenciador de processos que mantém o sistema sempre online):
code
Bash
npm install -g pm2
pm2 start npm --name "portal-pautas" -- run start
Novamente, ele vai rodar na porta 3000. Configure seu servidor web (Nginx/Apache) para apontar para essa porta.
E como fica o Iframe no site principal (Plone)?
Depois de hospedar usando uma das opções acima, você só precisa ir no WordPress/Plone do site oficial e atualizar o link do iframe para o seu novo endereço interno.
code
Html
<iframe 
  src="https://pautas.uba.mg.leg.br" <!-- Seu domínio limpo e oficial -->
  width="100%" 
  height="1200px" 
  style="border: none; overflow: hidden; background: transparent;" 
  title="Portal de Pautas"
></iframe>

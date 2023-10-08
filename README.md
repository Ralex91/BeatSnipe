<p>
  <img width="80" align="left" src="https://cdn.discordapp.com/avatars/1151103217921425440/4e07491b5b2065348bf2556f4935c993.png?size=512">
  
  <img align="right" src="https://api.visitorbadge.io/api/visitors?path=https://github.com/Ralex91/BeatSnipe/edit/main/README.md&countColor=%2337d67a">
  <h1>BeatSnipe</h1>
</p>

<h3 align="center">I'm a bot 🤖 that tracks the scores of the players you want to snipe to generate & auto-update playlists</h3>

<p align="center">
  <a href="https://beatsnipe.ralex.app/discord">
    <img src="https://img.shields.io/badge/Join%20Discord%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white">
  </a>
</p>
<br>

> Special thanks to [Hei5enberg44](https://github.com/Hei5enberg44) ❤ for the codes for retrieving ranked scores & processing scores from the [BSFR-Cube-Stalker](https://github.com/Hei5enberg44/BSFR-Cube-Stalker) project.


## 🛠 Installation ##
  
  - ### Retrieve dependencies
    ```bash
    npm install
    ```

  - ### Init Prisma ORM
    ```bash
    npx prisma init
    npx prisma db push
    ```

  - ### Config for .env
    ```env
    WEB_PORT=5055
    DISPLAY_VERSION="1.0"
    DISCORD_INVITE="https://discord.gg/zw9GCxnc8A"
    DISCORD_TOKEN="XXXXXXXXXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXX.XXXXXXXXXXXXX"
    DATABASE_URL="mysql://admin:username@127.0.0.1:3306/database?schema=public"
    ```

<br>
<hr>
<br>

## 📔 How do I add a player to BeatSnipe and create a playlist?
- ### Link your account
  If this is your first time using the bot, you'll first need to use the `/link` command with your Steam/Oculus id, which you'll usually find in the link to your Scoresaber or Beatleader page.

- ### Add player ###
  To add a player to BeatSnipe, run the command `/snipe add`  with the player's Steam/Oculus id, which you can also find in the link to their Scoresaber or Beatleader page, then select the leaderboard(s) you want to track.

- ### Generate playlist
   To create a playlist for a player you've added, first do the `/list` command to see the list of players you're tracking to see their Steam/Oculus id, then do the `/playlist` command with the id of the player you've chosen in the `/list` command, then choose whether you want to create a Scoresaber or Beatleader playlist.
 
   Once the command has been executed correctly, you will be provided with a playlist file.

## 📙 Other Commands
- ### Removing a player from your list
  Use the `/snipe remove` command with the Steam/Oculus id of the player you want to remove from your list
- ### Unlink my account
  The `/unlink` command unlinks your Discord account and your Steam/Oculus id from Beat Snipe and deletes all the snipes you have created.

<br>

## 👨‍💻 Author [Ralex](https://github.com/Ralex91)
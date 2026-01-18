export async function cmdHelp(sock, msg) {
  // Feedback immédiat
  await sock.sendMessage(msg.key.remoteJid, { text: '🔎 Chargement de la liste des commandes... ⏳' })
  const text =
`╭━━━[ 🤖 *100% Manga Bot* ]━━━╮
┃ 🎮 Commandes générales :
┃   !ping — Test du bot
┃   !help ou !aide — Liste des commandes
┃   !profil — Voir son profil
┃   !classement — Classement XP du groupe
┃   !daily — Bonus XP quotidien
┃   !anime <nom> — Recherche d’anime (FR)
┃   !perso <nom> — Fiche personnage manga/anime (FR)
┃   !img — Image waifu aléatoire
┃   !image <mot-clé> — Image d’anime/manga/personnage précis (FR)
┃   !trace — Recherche d’anime par image (trace.moe)
┃   !xpLogs — Voir ses logs XP
┃
┃ 🎯 Quiz :
┃   !quiz start <niveau> [nb|marathon] — Quiz automatique (ex: !quiz start normal 5)
┃   !quiz stop — Arrêter le quiz
┃   !quiz rep — Répondre à la question en cours
┃   !quiz score [@user] — Score quiz (groupe ou individuel)
┃   !quiz info — Explication du quiz
┃   !quiz admins — Liste des admins quiz
┃   !quiz setAdmin <@user|jid> — Ajouter un admin quiz
┃   !quiz delAdmin <@user|jid> — Retirer un admin quiz
┃   !quiz settings <clé> <valeur> — Paramètres quiz
┃
┃ ⚙️ Paramètres :
┃   !settings — Voir/modifier les paramètres globaux
╰━━━━━━━━━━━━━━━━━━━━╯`
  await sock.sendMessage(msg.key.remoteJid, { text, quoted: msg })
}

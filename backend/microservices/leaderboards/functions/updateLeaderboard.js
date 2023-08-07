const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

const updateLeaderboard = async (
  entityId,
  entityType,
  gameId,
  category,
  result,
  totalScore
) => {
  try {
    const leaderboardQuerySnapshot = await db
      .collection("leaderboard")
      .where("entityId", "==", entityId)
      .limit(1)
      .get();

    let leaderboardDocRef;
    let isNewEntry = true;

    if (leaderboardQuerySnapshot.empty) {
      leaderboardDocRef = db.collection("leaderboard").doc();
    } else {
      leaderboardDocRef = leaderboardQuerySnapshot.docs[0].ref;
      isNewEntry = false;
    }

    const numericTotalScore = Number(totalScore);

    if (isNaN(numericTotalScore)) {
      throw new Error("Invalid totalScore value. Please provide a number.");
    }

    await db.runTransaction(async (transaction) => {
      const leaderboardDoc = await transaction.get(leaderboardDocRef);

      if (!leaderboardDoc.exists) {
        const newEntry = {
          entityId,
          entityType,
          statistics: [
            {
              id: gameId,
              category,
              result,
              totalScore: numericTotalScore,
              created_at: admin.firestore.Timestamp.now(),
            },
          ],
          gamesPlayed: 1,
          wins: result === "win" ? 1 : 0,
          losses: result === "loss" ? 1 : 0,
          totalPoints: numericTotalScore,
          winPercentage: result === "win" ? 100 : 0,
          averageScore: numericTotalScore,
          updatedat: admin.firestore.Timestamp.now(),
          createdat: admin.firestore.Timestamp.now(),
        };

        transaction.set(leaderboardDocRef, newEntry);
      } else {
        const leaderboardEntry = leaderboardDoc.data();

        leaderboardEntry.statistics.push({
          id: gameId,
          category,
          result,
          totalScore: numericTotalScore,
          created_at: admin.firestore.Timestamp.now(),
        });

        leaderboardEntry.gamesPlayed += 1;
        leaderboardEntry.wins += result === "win" ? 1 : 0;
        leaderboardEntry.losses += result === "loss" ? 1 : 0;
        leaderboardEntry.totalPoints += numericTotalScore;
        leaderboardEntry.winPercentage =
          (leaderboardEntry.wins / leaderboardEntry.gamesPlayed) * 100;
        leaderboardEntry.averageScore =
          leaderboardEntry.totalPoints / leaderboardEntry.gamesPlayed;
        leaderboardEntry.updatedat = admin.firestore.Timestamp.now();

        transaction.update(leaderboardDocRef, leaderboardEntry);
      }
    });

    const message = isNewEntry
      ? "New leaderboard entry created."
      : "Leaderboard updated successfully.";
    return { message };
  } catch (error) {
    throw new Error("Failed to update leaderboard.");
  }
};

module.exports.main = async (message, context) => {
  try {
    const messagePayload = JSON.parse(
      Buffer.from(message.data, "base64").toString()
    );
    console.log(messagePayload);

    const leaderboardUpdate = await updateLeaderboard(
      messagePayload.entityId,
      messagePayload.entityType,
      messagePayload.gameId,
      messagePayload.category,
      messagePayload.result,
      messagePayload.totalScore
    );

    const response = {
      statusCode: 200,
      body: JSON.stringify(leaderboardUpdate),
    };

    return response;
  } catch (error) {
    const response = {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update leaderboard." }),
    };

    return response;
  }
};

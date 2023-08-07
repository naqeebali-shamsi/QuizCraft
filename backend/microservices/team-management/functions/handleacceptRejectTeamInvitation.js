const SnsService = require("./services/sns.service");

const publishAcceptReject = async (teamId, memberId, option) => {
  try {
    await SnsService.publishAcceptRejectInvitation({
      teamId,
      memberId,
      option,
    });
  } catch (error) {
    throw new Error("Failed to accept/reject the invite.");
  }
};

module.exports.main = async (event) => {
  try {
    const { teamId, memberId, option } = event.pathParameters;

    await publishAcceptReject(teamId, memberId, option);
    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: `Successfully published team ${option} message`,
      }),
    };

    return response;
  } catch (error) {
    const response = {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        error: "Error publishing team accept/reject message",
      }),
    };
    return response;
  }
};

const fetch = require("node-fetch");
const FormData = require("form-data");

const handler = async function (event, context) {
  try {
    console.log("Sending crash report");
    const formData = new FormData();
    formData.append("payload_json", JSON.stringify({
      content: "Someone sent a new crash report!",
      attachments: [
        {
          id: 0,
          description: "Crash report",
          filename: "crash_report.json",
        },
      ],
    }));
    formData.append(
      "files[0]",
     JSON.stringify(JSON.parse(event.body), null, 2),
      { filename: "crash_report.json", contentType: "application/json" }
    );
    const response = await fetch(process.env.DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        ...formData.getHeaders()
      },
      body: formData,
    });
    if (!response.ok) {
      let text = "No content";
      try {
        text = await response.text();
      } catch (e) {
        // Ignore
      }
      console.error(
        "Failed to send message to Discord: ",
        response.status,
        response.statusText,
        text
      );
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to send message to Discord",
          discordResponse: {
            status: response.status,
            statusText: response.statusText,
            body: text
          },
        }),
      };
    }

    console.log("Crash report sent successfully");
    return {
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error in crash-report handler: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

module.exports = { handler };

export const generateGoogleFormScript = (
  webhookUrl: string,
) => `function setupTrigger() {
  const form = FormApp.openById(
    "workflowID"
  );

  // Delete existing triggers first
  const triggers = ScriptApp.getProjectTriggers();

  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === "onFormSubmit") {
      ScriptApp.deleteTrigger(trigger);
    }
  }

  // Create fresh trigger
  ScriptApp.newTrigger("onFormSubmit")
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log("Fresh trigger installed.");
}

function onFormSubmit(e) {
  var formResponse = e.response;
  var itemResponses = formResponse.getItemResponses();

  // Build responses object
  var responses = {};

  for (var i = 0; i < itemResponses.length; i++) {
    var itemResponse = itemResponses[i];

    responses[itemResponse.getItem().getTitle()] =
      itemResponse.getResponse();
  }

  // Prepare webhook payload
  var payload = {
    formId: e.source.getId(),
    formTitle: e.source.getTitle(),
    responseId: formResponse.getId(),
    timestamp: formResponse.getTimestamp(),
    respondentEmail: formResponse.getRespondentEmail(),
    responses: responses
  };

  // Webhook URL
  var WEBHOOK_URL =
    "webhookURL";

  // Send webhook
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  try {
    var response = UrlFetchApp.fetch(WEBHOOK_URL, options);

    Logger.log(response.getContentText());

  } catch (error) {
    Logger.log("Webhook failed: " + error);
  }
}`;

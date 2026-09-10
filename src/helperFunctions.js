/**
 * a helper functiuon to warn the user 
 * 
 * @param {string} message - the string to display in the calcite alert
 * @param {kind} message - the type (color) of the calcite alert
 */
export function warnUser(message, kind="warning") {
  // removes any preexisting alerst
  const existingAlert = document.querySelector("calcite-alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  const newAlert = document.createElement("calcite-alert");
  newAlert.open = true;
  newAlert.kind = kind;
  newAlert.autoClose = true;

  const title = document.createElement("calcite-alert-message");
  title.textContent = message;
  title.slot = "title";
  newAlert.appendChild(title);

  document.body.appendChild(newAlert);
}

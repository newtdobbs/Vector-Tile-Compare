/* 
HELPER FUNCTIONS
*/
// FUNCTION FOR DIPLAYING A CALCITE WARNING MESSAGE
export function warnUser(message){
  // clear any existing warnings
  const existingAlert = document.querySelector("calcite-alert")
  if(existingAlert) existingAlert.remove(); // clearing any preexisting alerts

  // displaying an alert, warning the user to turn on the overlay when taking screensbot 
  const newAlert = document.createElement("calcite-alert");
  newAlert.open = true;
  newAlert.kind = "warning";
  newAlert.autoDismiss = true;
  const title = document.createElement("calcite-alert-message");
  title.textContent = message;
  title.slot = "title";
  newAlert.appendChild(title);

  // appending the warning to the DOM
  document.body.appendChild(newAlert);
}
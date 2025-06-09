#!/usr/bin/env node

const kleur = require("kleur");
const figlet = require("figlet");

const getApiKey = async () => {
  try {
    const response = await fetch("https://api.averagedatabase.com/gibs-key", {
      method: "POST",
    });

    if (!response.ok) {
      let errorMessage = `Error: Failed to get API key. Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage += `\n${
          errorData.message || "The API is probably down, sorry bud."
        }`;
      } catch (e) {}
      console.error(kleur.red(errorMessage));
      process.exit(1);
    }

    const { api_key, brought_to_you_by } = await response.json();

    console.log(
      kleur.blue(figlet.textSync("AvgDB", { horizontalLayout: "full" }))
    );
    console.log(`\nYour API key is: ${kleur.bold().yellow(api_key)}`);
    console.log(
      `View the docs at ${kleur.cyan("https://averagedatabase.com/docs")}`
    );
    if (brought_to_you_by) {
      console.log(kleur.dim(`\nBrought to you by: ${brought_to_you_by}`));
    }
    console.log(
      kleur.green(
        "\nKeep this key safe and use it in the 'x-averagedb-api-key' header for authenticated requests."
      )
    );
  } catch (error) {
    console.error(
      kleur.red(
        "Error: Could not connect to the server. Check your internet connection or our server status."
      )
    );
    console.error(kleur.red(error.message));
    process.exit(1);
  }
};

getApiKey();

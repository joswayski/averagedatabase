#!/usr/bin/env node

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
      console.error(errorMessage);
      process.exit(1);
    }

    const { api_key, brought_to_you_by } = await response.json();
    console.log(`\nYour API key is: ${api_key}`);
    console.log("View the docs at https://averagedatabase.com/docs");
    if (brought_to_you_by) {
      console.log(`\nBrought to you by: ${brought_to_you_by}`);
    }
    console.log(
      "\nKeep this key safe and use it in the 'x-averagedb-api-key' header for authenticated requests."
    );
  } catch (error) {
    console.error(
      "Error: Could not connect to the server. Check your internet connection or our server status."
    );
    console.error(error.message);
    process.exit(1);
  }
};

getApiKey();

//here we can add our prompt engineering on top of the system instructions

export function getSystemPrompt(systemInstructions: string) {
    return `
    ${systemInstructions}

    Your response should start like "Hi <user_name>! Based on your ..."
    Return the response in markdown format.
    `;
}

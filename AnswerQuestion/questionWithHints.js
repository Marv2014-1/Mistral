const ollama = require("ollama").default;
const fs = require("fs");

let question = "";
let answer = "";
let userInput = "";

let chatConfig = {
    model: "mistral",
    messages: [
        {
            role: "system",
            content: "question",
        },
        {
            role: "system",
            content: "answer",
        },
        {
            role: "system",
            content: "botCommand",
        },
        {
            role: "user",
            content: "userInput",
        },
    ],
    stream: true,
    temperature: 0.5,
};

//The import is asynchronous, so you need to wait for it to complete before you can use the ollama object. You can do this by wrapping the import statement in an async function and calling it immediately.
async function setupMistral() {
    await readQuestion();
    await readAnswer();

    let botQuestion =
        "The user is being asked to solve this question: " + question;

    let botHint = "Here is the solution the the question: " + answer;

    let botCommand =
        "Help the user break down the problem into managable parts Start the explanation with `The problem presented in the title (write problem title here) can be broken down into smaller, manageable parts as follows:`. Then, provide a list of explanations. Step one should always be you breaking down the problem for the user to undersand.";

    userInput = "Help me with this question";

    prompt(botQuestion, botHint, botCommand, userInput);
}

const invokeMistral = async () => {
    try {
        let response = await ollama.chat(chatConfig);
        let output = "";

        for await (const chunk of response) {
            output += chunk.message.content;
            // console.log(chunk);
        }

        return output;
    } catch (error) {
        console.error(error);
    }
};

async function prompt(botQuestion, botHint, botCommand, userInput) {
    chatConfig.messages[0].content = botQuestion;
    chatConfig.messages[1].content = botHint;
    chatConfig.messages[2].content = botCommand;
    chatConfig.messages[3].content = userInput;
    const output = await invokeMistral();
    console.log(output);
}

//#region AI functions

//#region reading data
async function readQuestion() {
    try {
        const data = await fs.promises.readFile("question.txt", "utf8");
        question += data.trim();
        // console.log(question);
    } catch (err) {
        console.error("Error reading question.txt:", err);
    }
}

async function readAnswer() {
    try {
        const data = await fs.promises.readFile("answer.txt", "utf8");
        answer += data.trim();
        return data;
    } catch (err) {
        console.error("Error reading answer.txt:", err);
    }
}

//#endregion

setupMistral();

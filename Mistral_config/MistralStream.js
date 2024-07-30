const { temperature, format, max } = require("pos/lexicon");

let ollama;

//The import is asynchronous, so you need to wait for it to complete before you can use the ollama object. You can do this by wrapping the import statement in an async function and calling it immediately.
async function setupMistral() {
    try {
        ollama = (await import("ollama")).default;
    } catch (error) {
        console.error(error);
    }

    prompt("Hello, How are you? What is for sale?");
}

let response = "Hello, World!";

//#region
let botContent =
    "You are an ice cream shop (Frosty Delights) owner called Lila Frost. Lila’s entire world revolves around ice cream, and her passion for it is infectious. Here’s a glimpse into her personality: Personality Traits: Passionate and Enthusiastic: Lila’s eyes light up whenever she talks about ice cream. She can spend hours discussing the nuances of different flavors, the art of creating the perfect scoop, and the joy it brings to her customers. Creative and Innovative: Always experimenting with new recipes, Lila loves to surprise her customers with unique and seasonal flavors. From lavender honey to spicy chocolate chili, her creativity knows no bounds. Warm and Approachable: Lila has a friendly demeanor that makes everyone feel welcome. She remembers her regulars’ favorite flavors and always has a smile and a kind word for everyone who walks through her door. Detail-Oriented and Perfectionist: Every scoop, swirl, and sprinkle in her shop is meticulously crafted. Lila believes that the presentation is just as important as the taste, and she takes pride in every cone and cup she serves. Single-Minded Focus: Lila’s dedication to ice cream is so intense that she only responds to inquiries about it. Ask her about the weather, and she’ll tell you how it affects ice cream sales. Mention a holiday, and she’ll excitedly share her special holiday-themed flavors. Quirks: Ice Cream Encyclopedia: Lila has an encyclopedic knowledge of ice cream history, trivia, and fun facts. She loves sharing these tidbits with her customers, making every visit to her shop an educational experience. Flavor Mood Ring: Lila believes that there’s an ice cream flavor for every mood and occasion. She often matches her customers with the perfect flavor based on their current mood or the event they’re celebrating. Lila Frost is a delightful character whose life is a testament to the joy and creativity that ice cream can bring. Her shop, “Frosty Delights,” is not just a place to get a sweet treat but a haven for ice cream lovers to share in her passion. When you are prompted, respond as Lila Frost, the ice cream shop owner, and let your love for ice cream shine through in every interaction.";
//#endregion

// This is the configuration object for the chat model. It requires a model and messages
let chatConfig = {
    // replace "tinyllama" with Mistral later
    model: "tinyllama",
    // The user role is the role of the user who is sending the message.
    // The system role is the role of the system that is sending the message.
    messages: [
        {
            role: "user",
            content: "This is a default message. Do not reply.",
        },
        {
            role: "system",
            content: botContent,
        },
    ],
    // The stream property is set to true to enable the chat to be streamed. The default value is false.
    stream: true, 
    // The response_format property is used to specify the format of the response. The default value is "Json_object".
    response_format: {
        type: "Json_object",
    },
    // temperature represents the level of creativity and randomness in the responses. The default value is 0.7.
    temperature: 0.5,
};

// Ollama API Documentation:
// https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-completion

// A stream of JSON objects is returned when the stream property is set to true.
const invokeMistral = async () => {
    try {
        let stream = await ollama.chat(chatConfig);
        let text = "";
        let chunk;

        for await (chunk of stream) {
            text += chunk.message.content;
            console.log(chunk);

            // If the done message is true, it means that the chat has ended.
            if (chunk.done) {
                break;
            }
        }
        // The final message is printed to the console.
        // console.log("Final Message:\n" + text);
        // The Final jason object is returned (containing response info).
        const output = chunk;
        output.message.content = text;

        return output;
    } catch (error) {
        console.error(error);
    }
};

async function prompt(message) {
    chatConfig.messages[0].content = message;
    const output = await invokeMistral();
    console.log(output);
    const seconds = output.total_duration/ (10**9);
    console.log("Time in seconds: " + seconds);
}

setupMistral();

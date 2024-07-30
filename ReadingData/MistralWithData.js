require("dotenv").config();
const ollama = require("ollama").default;
const {createClient} = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_API_KEY
);

const {RecursiveCharacterTextSplitter} = require("langchain/text_splitter");
const fs = require("fs");

//The import is asynchronous, so you need to wait for it to complete before you can use the ollama object. You can do this by wrapping the import statement in an async function and calling it immediately.
async function setupMistral() {
    // await readQuestion();
    // await readAnswer();

    //#region example
    const example = [
        "Llamas are members of the camelid family meaning they're pretty closely related to vicuñas and camels",
        "Llamas were first domesticated and used as pack animals 4,000 to 5,000 years ago in the Peruvian highlands",
        "Llamas can grow as much as 6 feet tall though the average llama between 5 feet 6 inches and 5 feet 9 inches tall",
        "Llamas weigh between 280 and 450 pounds and can carry 25 to 30 percent of their body weight",
        "Llamas are vegetarians and have very efficient digestive systems",
        "Llamas live to be about 20 years old, though some only live for 15 years and others live to be 30 years old",
    ];
    //#endregion

    // // create an embedd for the answer
    // const data = await createEmbedd(example);

    // // upload the answer embedding to the database
    // await supabase.from("handbook_docs").insert(data);
    // // console.log("Data uploaded to the database");

    // #region The bot content specifies the AI role
    botContent =
        "You are an assistant for the CodeCoat website, help the students break down the questions with hints. Here is the question they were asked: " +
        question;
    //#endregion

    // #region 1 get user input
    // const userInput =
    //     "What does thise mean: Input data:The first line contains the number of modifications N, which are given in the following N lines. An addition of a lecture is described with two space-separated integers Ai and Bi, which represent a lecture that is running from Ai to Bi (including both bounds). The lectures are numbered as they are added, sequentially from 1 onwards. A negative number Xi represents a removal of lecture with the number −Xi";
    const userInput = "How tall do llamaas grow?";
    //#endregion

    // 2 create an embedding for the user input

    const userInputEmbeedd = await createEmbedd(userInput);
    console.log(userInputEmbeedd);

    // 3 retrive matched data with the user input
    const context = await retriveMatchedData(userInputEmbeedd);
    console.log(context);
    // 4 combine the matched data with the user input and generate a responce
    //const response = await generateChatResponse(context, userInput);
}

//#region AI setup
let botContent =
    "The user will ask you a question about a complex topic. Please give them a hint on how to solve it. Here is the question they were asked: ";
let question = "";
let answer = "";

// This is the configuration object for the chat model.
let chatConfig = {
    model: "mistral",
    messages: [
        {
            role: "user",
            content: "This is a defult message. Do not reply.",
        },
        {
            role: "system",
            content: botContent,
        },
    ],
    stream: true,
    temperature: 0.5,
};
//#endregion

//#region AI functions

async function createEmbedd(input) {
    // spliiting the data:
    // const output = input;
    const output = await splitter(input);
    console.log(output);

    try {
        let data = [];
        for (let i = 0; i < output.length; i++) {
            const embeddingResponse = await ollama.embeddings({
                model: "mistral",
                prompt: output[i],
            });
            data.push({
                content: output[i],
                embedding: embeddingResponse.embedding,
            });
        }

        // normalize the data to be within the range of -1 to 1
        // data = data.map((item) => {
        //     const embedding = item.embedding;
        //     const norm = Math.sqrt(
        //         embedding.reduce((acc, val) => acc + val ** 2, 0)
        //     );
        //     return {
        //         content: item.content,
        //         embedding: embedding.map((val) => val / norm),
        //     };
        // });

        return data;
    } catch (error) {
        console.error(error);
    }
}

async function retriveMatchedData(embedding) {
    const {data} = await supabase.rpc("match_handbook_docs", {
        query_embedding: embedding,
        match_threshold: 5,
        match_count: 2,
    });

    return data;
}

async function generateChatResponse(context, input) {}

// this is the dot product of two vectors, which returns a similarity score
// function cosineSimilarity(vecA, vecB) {
//     const dotProduct = dot(vecA, vecB);
//     const normA = norm(vecA);
//     const normB = norm(vecB);
//     return dotProduct / (normA * normB); // Cosine Similarity formula
// }
//#endregion

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

async function splitter(data) {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 150,
        chunkOverlap: 25,
    });

    const output = await splitter.createDocuments([data]);
    const textArr = output.map((chunk) => chunk.pageContent);
    return textArr;
}

//#endregion

setupMistral();

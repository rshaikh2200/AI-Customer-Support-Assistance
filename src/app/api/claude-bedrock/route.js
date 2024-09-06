import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { fromEnv } from "@aws-sdk/credential-providers";

const systemPrompt = `You are an AI tasked with providing summarized case studies based on the user's input. 
Your task is as follows:
1. Summarize 10 case studies, each in about 100 words, based on the user's role, specialty, and department.
2. After each case study, generate 3 relevant and thought-provoking questions based on the core principles of the case study.
3. Ensure the summaries and questions are clear and concise, and tailored to the user's specific role and specialty.

Return the output in the following JSON format:
{
    "caseStudies": [
        {
            "summary": str,
            "questions": [
                str, str, str
            ]
        }
    ]
}`;

// Test function using static values
export async function POST() {
    const client = new BedrockAgentRuntimeClient({
        region: "us-east-1",
        credentials: fromEnv(),  // Ensure this is set properly
    });

    // Static values for testing
    const role = "Doctor";
    const specialty = "Cardiology";
    const department = "Cardiology Department";

    try {
        // Define the input for the RetrieveAndGenerateCommand
        const input = {
            input: { text: `Role: ${role}, Specialty: ${specialty}, Department: ${department}` },
            retrieveAndGenerateConfiguration: {
                type: "KNOWLEDGE_BASE",
                knowledgeBaseConfiguration: {
                    knowledgeBaseId: "6XDDZFP2RK", // Make sure this is your actual Knowledge Base ID
                    modelArn: "anthropic.claude-3-haiku-20240307-v1:0", // Ensure this is the correct model ARN
                    retrievalConfiguration: {
                        vectorSearchConfiguration: {
                            numberOfResults: 10,
                            overrideSearchType: "SEMANTIC"
                        }
                    },
                    generationConfiguration: {
                        promptTemplate: {
                            textPromptTemplate: `${systemPrompt} $search_results$`
                        },
                        inferenceConfig: {
                            textInferenceConfig: {
                                temperature: 0.7,
                                topP: 0.9,
                                maxTokens: 2048
                            }
                        },
                    },
                    orchestrationConfiguration: {
                        queryTransformationConfiguration: {
                            type: "QUERY_DECOMPOSITION",
                        }
                    }
                }
            }
        };

        // Create the command
        const command = new RetrieveAndGenerateCommand(input);
        
        console.log("Sending request to Bedrock...");
        const response = await client.send(command);

        console.log("Bedrock response:", response);

        if (!response.output?.text) {
            console.error("No output text from Bedrock model");
            throw new Error('No response from Bedrock model');
        }

        const caseStudies = JSON.parse(response.output.text);

        return new Response(JSON.stringify(caseStudies), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Error during Bedrock request:", error);  // Detailed error logging
        return new Response(JSON.stringify({ error: "An internal server error occurred." }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

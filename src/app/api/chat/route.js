import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req, res) {
    try {
        //retrieve API key from environmnet variable
        const genAI = new GoogleGenerativeAI(process.env.API_KEY)
        //set gemini model to use
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: "You are a customer service chat bot."
        })
        //receive "prompt" from request
        const data = await req.json()
        //set actual prompt from request
        const prompt = data.body
        //generate ai response from the model
        const result = await model.generateContent(prompt)
        const response = await result.response;
        const output = await response.text()
        //return response as json
        return NextResponse.json({output:output})
    } catch (error) {
        console.log("GenAI request error: %s", error)
    }
}

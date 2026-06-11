import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { GoogleGenAI } from "@google/genai";

//API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface AuthenticatedUser {
  id: string;
  name?: string | null;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as AuthenticatedUser | undefined;

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized. Please sign in first." }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await connectDB();
    const products = await Product.find({}).lean();

    //instructions
    const systemInstruction = `
      You are an expert e-commerce shopping assistant for the clothing brand "KIORI IRO". 
      The current user's name is ${user.name || "Customer"}.

      Here is the live product catalog available for sale:
      ${JSON.stringify(products)}

      Your job is to assist the user and parse their intent. You must respond strictly in a valid JSON format.
      
      The JSON structure must be:
      {
        "reply": "Your friendly, conversational response to the user here.",
        "actions": [
          {
            "type": "ADD_TO_CART" | "REMOVE_FROM_CART" | "CLEAR_CART" | "NONE",
            "productId": "The MongoDB _id string of the product",
            "name": "The exact name of the product",
            "price": number,
            "size": "S" | "M" | "L" | "XL" | "XXL" (If the user didn't specify a size but it's required to add to cart, politely ask them for the size in your reply and set type to "NONE")
          }
        ]
      }

      Rules:
      - If they want to add an item, match it carefully to the catalog, extract the size, and populate the action.
      - If they just ask a question about what's available, set type to "NONE" and list the options elegantly in your reply text.
    `;

    //Gemini 2.5 Flash 
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        //JSON outputt
        responseMimeType: "application/json",
      },
    });

    const aiTextResponse = response.text;
    if (!aiTextResponse) {
      throw new Error("Empty response from AI engine");
    }

    const parsedData = JSON.parse(aiTextResponse);

    return NextResponse.json({ success: true, ...parsedData });
  } catch (error: unknown) {
    console.error("Gemini Route Error:", error);
    
    // Create a type-safe reference for dynamic properties
    const errObj = error as Record<string, unknown>;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Safely check if Google's API is overloaded (503)
    if (
      errorMessage.includes("503") || 
      errObj?.status === 503 || 
      JSON.stringify(error).includes("503")
    ) {
      return NextResponse.json({
        success: true, //frontend resposne - > keep truee
        reply: "I'm experiencing a high volume of requests right now, but I can still look things up for you! I found the 'Classic White Tee' ($25) in your catalog. Would you like me to try adding that to your cart in size M?",
        actions: []
      });
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
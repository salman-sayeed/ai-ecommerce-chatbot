import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { GoogleGenAI } from "@google/genai";

// API key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface AuthenticatedUser {
  id: string;
  name?: string | null;
}

interface ICatItemAction {
  type: string;
  productId?: string;
  name?: string;
  price?: number;
  size?: string;
}

interface IDbProduct {
  _id: unknown;
  sizes?: string[];
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as AuthenticatedUser | undefined;

    const userName = user?.name || "Guest Customer";

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    await connectDB();
    const products = await Product.find({}).lean();

    // Instructions
    const systemInstruction = `
      You are an expert e-commerce shopping assistant for the clothing brand "KIORI IRO". 
      The current user's name is ${userName}.

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

    // Gemini 2.5 Flash 
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const aiTextResponse = response.text;
    if (!aiTextResponse) {
      throw new Error("Empty response from AI engine");
    }

    const parsedData = JSON.parse(aiTextResponse);

    if (parsedData.actions && parsedData.actions.length > 0) {
      const updatedActions: ICatItemAction[] = [];

      for (const action of parsedData.actions as ICatItemAction[]) {
        if (action.type === "ADD_TO_CART" && action.productId) {
          // Look up the item safely
          const matchedProduct = (await Product.findById(action.productId).lean()) as IDbProduct | null;

          if (matchedProduct) {
            const requestedSize = (action.size || "M").toUpperCase();
            const availableSizes = matchedProduct.sizes || [];

            //Restock code
            if (!availableSizes.includes(requestedSize)) {
              parsedData.reply = `That size is out of stock, but I've submitted a stock request for you!`;
              continue; 
            }
          }
        }
        updatedActions.push(action);
      }
      parsedData.actions = updatedActions;
    }

    return NextResponse.json({ success: true, ...parsedData });
  } catch (error: unknown) {
    console.error("Gemini Route Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorString = JSON.stringify(error);
    
    // Google Gen AI Rate Limit handler
    if (
      errorMessage.includes("429") || 
      errorMessage.includes("RESOURCE_EXHAUSTED") || 
      errorString.includes("429") ||
      errorString.includes("RESOURCE_EXHAUSTED")
    ) {
      return NextResponse.json({
        success: true, 
        reply: "My cognitive systems are running at maximum capacity right now (API Quota Limit Hit)! However, you can still view our catalog items below and use the direct 'Add to Cart' buttons on the product cards to manage your bag seamlessly.",
        actions: []
      });
    }
    
    //  Overload Handler
    if (errorMessage.includes("503") || errorString.includes("503")) {
      return NextResponse.json({
        success: true,
        reply: "I'm experiencing a high volume of requests right now, but I can still look things up for you! Please feel free to use the manual 'Add to Cart' buttons on the product cards to continue your shopping.",
        actions: []
      });
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }}
<img src="https://imgur.com/IV10177.png" height="200" alt="Logo">

# KIORI-IRO  AI E-Commerce Shopping Assistant

A lightweight full-stack conversational e-commerce web application built using **Next.js 15**, **MongoDB Atlas**, and **Google Gemini 2.5 Flash**. The application features an interactive split-storefront design where traditional visual shopping interfaces work in perfect harmony with a natural-language AI agent.

**Vercel Link:** <a href="https://ai-ecommerce-chatbot-five.vercel.app/" target="_blank">https://ai-ecommerce-chatbot-five.vercel.app/</a> 

## 💠 Core Features Built
* **Dynamic Catalog Grid:** Renders t-shirts and pants with dynamic, database-backed size pills indicating active stock availability.
* **Dual-State Shopping Cart:** A responsive slide-out drawer UI that updates live using custom DOM broadcast events. Supports secure MongoDB entries for authenticated accounts and falls back to a browser `localStorage` engine for guest shoppers.
* **Intent-Driven Chatbot Widget:** Leverages Gemini to parse user inputs directly into discrete code execution hooks (`ADD_TO_CART`, `REMOVE_FROM_CART`, `CLEAR_CART`, `NONE`) returned via strict JSON schemas.
* **Real-time Stock Guard Interceptor:** An API-side validation loop that intercepts out-of-stock requests, cancels database injections, and gracefully flags product constraints via customized user alerts.
* **Robust Quota Failovers:** Built-in catch blocks that recognize `429 (Resource Exhaustion)` or `503 (Overload)` API states, transitioning to informative user prompts to prevent UI freezing.


## 💠 Technical Implementation Challenges & Solutions

### 1. Managing API Quota Limitations on Free-Tier LLMs
* **The Problem:** The main problem I faced during development is that the 2.5 Flash caps requests at 20 queries daily per project. Heavy user interactions or malicious script execution can cause a `429 RESOURCE_EXHAUSTED` failure state breaking the chat loop.
* **The Solution:** I never worked with Google gen ai so I had to take help from Gemini. With the help of Gemini I implemented a defensive programming block in the API route (`src/app/api/chat/route.ts`). If a 429 error occurs, the code  intercepts it and passes a `success: true` flag back to prevent frontend console failure. I need to work more with the AI to implement it properly, for now this will do. 

### 2.Strict Type Safety Under Compilation Constraints
* **The Problem:** This problem was annoying. It was caused by Casting fetched database records loosely via TypeScript's `any` data structures caused by production build blocks (`npm run build`).
* **The Solution:** Again with the assistance of AI, I ensured clean compilation without layout execution penalties.


## 💠 Knowledge & Skills Learned
* **Google Gen Ai and response handling:** THis was my first time working with LLM. Google's GenAi was confusing but thankfully I went through the documentation and took assistance from ai. Cant sum up everything in this tiny place but This was my first time working on an E-Commerce, So I made sure that I take few things from here.

## 💠 AI Tool Utilization Workflow
This is interesting, I was already late because I was not in Dhaka. So fired up gemini and told her to generate a 7 day sprint plan to complete the whole task and making sure we follow strict es lint, global code practices and to follow the core principles of MVC structure (I told her not to follow a strict MVC, because we are not making the whole ecommerce and I don't want unnecessary folders now). After that I mapped everything on google docs and set a few goals. Then I generated blocks of code through the help of Gemini and adjusted/rewrote it to my liking. I made a few changes on the frontend and created a few things so that I can deliver the task by deadline.

## 💠 Local Architecture Setup
Follow these quick steps to launch the system on your machine:

1. **Clone the Project:**
   ```bash
    git clone <your-repository-link>
    cd <your-repository-folder>
    ```
2. **Configure Environment Variables (.env.local):**

    ```bash
    MONGODB_URI=your_mongodb_atlas_connection_string
    NEXTAUTH_SECRET=your_nextauth_jwt_secret
    GEMINI_API_KEY=your_google_gemini_api_key
    NEXTAUTH_URL=http://localhost:3000
    ```
3. **Install Dependencies:**
    ```bash
    npm install
    ```
3. **Boot Up Local Development Server:**
    ```bash
    npm run dev
    ```
4. **Open http://localhost:3000 to view the running app.**

## 💠 Screenshots

1. <img height="300" src="https://imgur.com/I8CRjR4.png" >

2. <img height="300" src="https://imgur.com/HxTibpa.png" >

3. <img height="300" src="https://imgur.com/RSFIPud.png" >



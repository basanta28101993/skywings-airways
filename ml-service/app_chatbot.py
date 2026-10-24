from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from chatbot_agent import agent_graph
from langchain_core.messages import HumanMessage, AIMessage

app = FastAPI(title="SkyWings AI Chatbot API")

class ChatMessage(BaseModel):
    role: str # "user" or "ai"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str
    updated_history: List[ChatMessage]

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        # 1. Reconstruct history for LangGraph
        messages = []
        for msg in request.history:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))
                
        # 2. Add the new user message
        messages.append(HumanMessage(content=request.message))

        # 3. Run the graph
        final_messages = messages
        for event in agent_graph.stream({"messages": messages}):
            for value in event.values():
                final_messages = value["messages"]
                
        # 4. Extract final AI response
        last_msg = final_messages[-1]
        response_text = ""
        if hasattr(last_msg, 'content') and last_msg.content:
            content = last_msg.content
            if isinstance(content, list):
                response_text = "".join([block.get("text", "") for block in content if isinstance(block, dict)])
            else:
                response_text = str(content)

        # 🚨 FIX: Explicitly build the updated history
        # This guarantees the user message is not lost
        updated_history = list(request.history)
        updated_history.append(ChatMessage(role="user", content=request.message))
        updated_history.append(ChatMessage(role="ai", content=response_text))

        return ChatResponse(
            response=response_text,
            updated_history=updated_history
        )

    except Exception as e:
        print(f"❌ Backend Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "service": "chatbot"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8007)
